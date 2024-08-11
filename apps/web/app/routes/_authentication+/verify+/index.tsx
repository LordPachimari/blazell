import { cn } from "@blazell/ui";
import { Button } from "@blazell/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
	REGEXP_ONLY_DIGITS_AND_CHARS,
} from "@blazell/ui/input-otp";
import { LoadingSpinner } from "@blazell/ui/loading";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
	redirect,
} from "@remix-run/cloudflare";
import { Form, useActionData } from "@remix-run/react";
import { getHonoClient } from "server";
import { z } from "zod";
import { useIsPending } from "~/hooks/use-is-pending";
import { SESSION_KEY } from "~/server/auth.server";
import { checkHoneypot } from "~/server/honeypot.server";
export const loader = async (args: LoaderFunctionArgs) => {
	const { request, context } = args;
	const { session } = context;
	const url = new URL(request.url);
	const origin = url.origin;
	const searchParams = url.searchParams;

	const otp = searchParams.get("otp");
	const redirectTo = searchParams.get("redirectTo");
	const target = searchParams.get("target");
	console.log("otp", otp, target);

	if (otp && target) {
		const honoClient = getHonoClient(origin);
		const validationResult = await honoClient.api.auth["verify-otp"].$post(
			{
				json: {
					otp,
					target,
				},
			},
			{
				headers: {
					credentials: "include",
				},
			},
		);

		console.log("from link", validationResult.status);

		if (validationResult.ok) {
			const {
				valid,
				onboard,
				session: userSession,
			} = await validationResult.json();
			if (!valid) {
				console.log("INVALID");
				return json({});
			}

			const onboardingURL = new URL(`${origin}/onboarding`);
			redirectTo && onboardingURL.searchParams.set("redirectTo", redirectTo);
			target && onboardingURL.searchParams.set("target", target);
			userSession && session.set(SESSION_KEY, userSession.id);
			console.log("WHAT IS ONBOARD", onboard);
			if (onboard) {
				return redirect(onboardingURL.toString());
			}
			return redirect(redirectTo ?? "/marketplace");
		}
		return json({});
	}
	return json({});
};
export const action = async ({ request, context }: ActionFunctionArgs) => {
	const { session } = context;
	const formData = await request.formData();
	const url = new URL(request.url);
	const origin = url.origin;
	checkHoneypot(formData, context.cloudflare.env.HONEYPOT_SECRET);
	const submission = parseWithZod(formData, {
		schema: z.object({
			otp: z.string(),
		}),
	});

	const searchParams = url.searchParams;

	const redirectTo = searchParams.get("redirectTo");
	const target = searchParams.get("target");
	if (submission.status !== "success" || !target) {
		return json({
			result: submission.reply({
				fieldErrors: {
					otp: ["Invalid code"],
				},
			}),
		});
	}
	const honoClient = getHonoClient(origin);
	const validationResult = await honoClient.api.auth["verify-otp"].$post(
		{
			json: {
				otp: submission.value.otp,
				target: target,
			},
		},
		{
			headers: {
				credentials: "include",
			},
		},
	);

	if (validationResult.ok) {
		const {
			valid,
			onboard,
			session: userSession,
		} = await validationResult.json();

		if (!valid) {
			return json({
				result: submission.reply({
					fieldErrors: {
						otp: ["Invalid code"],
					},
				}),
			});
		}
		userSession && session.set(SESSION_KEY, userSession.id);

		return redirect(onboard ? "/onboarding" : redirectTo ?? "/marketplace");
	}
	return json({
		result: submission.reply({
			fieldErrors: {
				otp: ["Error happened. Please try again later."],
			},
		}),
	});
};

function Verify() {
	const actionData = useActionData<typeof action>();
	const isPending = useIsPending();

	const [form, fields] = useForm({
		id: "verify-form",
		constraint: getZodConstraint(
			z.object({
				otp: z.string(),
			}),
		),
		defaultValue: { otp: "" },
		lastResult: actionData?.result,
	});

	return (
		<div className="flex items-center justify-center py-12">
			<div className="mx-auto grid w-[350px] gap-6">
				<div className="grid gap-2 text-center">
					<h1 className="text-3xl font-freeman">Enter code</h1>
				</div>
				<div>
					<p className="text-center text-slate-11">Check your email.</p>
				</div>
				<Form method="POST" {...getFormProps(form)}>
					<div className="flex justify-center flex-col gap-4 items-center">
						<InputOTP
							maxLength={6}
							pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
							className={cn("bg-component border border-border", {
								"border-red-9 text-red-9": fields.otp.errors,
							})}
							disabled={isPending}
							autoFocus
							{...getInputProps(fields.otp, { type: "text" })}
						>
							<InputOTPGroup>
								<InputOTPSlot index={0} />
								<InputOTPSlot index={1} />
								<InputOTPSlot index={2} />
								<InputOTPSlot index={3} />
								<InputOTPSlot index={4} />
								<InputOTPSlot index={5} />
							</InputOTPGroup>
						</InputOTP>
						{fields.otp.errors && (
							<p className="px-1 text-sm text-red-9">{fields.otp.errors[0]}</p>
						)}

						<Button type="submit" disabled={isPending}>
							{isPending && (
								<LoadingSpinner className="text-white size-4 mr-2" />
							)}
							Submit
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
}
export default Verify;