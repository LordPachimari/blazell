import { Button } from "@blazell/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
	REGEXP_ONLY_DIGITS_AND_CHARS,
} from "@blazell/ui/input-otp";
import { VerifySchema } from "@blazell/validators";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
	redirect,
} from "@remix-run/cloudflare";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { Authentication, getHonoClient } from "server";
import { useIsPending } from "~/hooks/use-is-pending";
import { checkHoneypot } from "~/server/honeypot.server";
import { getAuthSessionStorage } from "~/sessions.server";
import { getDomainUrl } from "~/utils/helpers";
export const loader = async (args: LoaderFunctionArgs) => {
	const { request } = args;
	const url = new URL(request.url);
	const origin = url.origin;
	const searchParams = url.searchParams;

	const otp = searchParams.get("otp");
	const redirectTo = searchParams.get("redirectTo");
	const target = searchParams.get("target");

	const nextURL = new URL(`${getDomainUrl(request)}/onboarding`);
	redirectTo && nextURL.searchParams.set("redirectTo", redirectTo);
	target && nextURL.searchParams.set("target", target);

	if (otp && target) {
		const honoClient = getHonoClient(origin);
		const validationResult = await honoClient.api.auth.verify.$post(
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

		if (validationResult.ok) {
			const { valid } = await validationResult.json();
			if (!valid) {
				return json({});
			}
			redirect(nextURL.toString());
		}
		return json({});
	}
	return json({});
};
export const action = async ({ request, context }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const url = new URL(request.url);
	const origin = url.origin;
	checkHoneypot(formData, context.cloudflare.env.HONEYPOT_SECRET);
	const submission = parseWithZod(formData, {
		schema: VerifySchema,
	});
	if (submission.status !== "success") {
		return json({ result: submission.reply() });
	}

	const honoClient = getHonoClient(origin);
	const validationResult = await honoClient.api.auth.verify.$post(
		{
			json: {
				otp: submission.value.otp,
				target: submission.value.target,
			},
		},
		{
			headers: {
				credentials: "include",
			},
		},
	);

	if (validationResult.ok) {
		const { valid } = await validationResult.json();
		if (!valid) {
			return json({
				result: submission.reply({
					fieldErrors: {
						otp: ["Invalid code"],
					},
				}),
			});
		}

		let signUp = false;

		const userResult = await honoClient.api.users.email[":email"].$get({
			param: {
				email: submission.value.target,
			},
		});

		if (userResult.ok) {
			let user = await userResult.json();
			if (!user) {
				signUp = true;
				const userResult = await honoClient.api.users.create.$post({
					json: {
						email: submission.value.target,
					},
				});
				if (userResult.ok) {
					user = await userResult.json();
				} else {
					return json({
						result: submission.reply({
							fieldErrors: {
								otp: ["Error happened. Please try again later."],
							},
						}),
					});
				}
			}

			const auth = new Authentication({
				serverURL: origin,
			});
			const session = await auth.createSession(user.id);

			const authSessionStorage = getAuthSessionStorage({
				...(context.cloudflare.env.ENVIRONMENT && {
					ENVIRONMENT: context.cloudflare.env.ENVIRONMENT,
				}),
				...(context.cloudflare.env.SESSION_SECRET && {
					SESSION_SECRET: context.cloudflare.env.SESSION_SECRET,
				}),
			});
			const authSession = await authSessionStorage.getSession(
				request.headers.get("cookie"),
			);
			return redirect(
				signUp ? "/onboarding" : submission.value.redirectTo ?? "/marketplace",
				{
					headers: {
						...(session &&
							!session.fresh && {
								"set-cookie": await authSessionStorage.commitSession(
									authSession,
									{
										expires: new Date(session.expiresAt),
									},
								),
							}),
					},
				},
			);
		}
		return json({
			result: submission.reply({
				fieldErrors: {
					otp: ["Error happened. Please try again later."],
				},
			}),
		});
	}
	return json(
		{
			result: submission.reply({
				fieldErrors: {
					email: ["Something went wrong. Please try again later."],
				},
			}),
		},
		{ status: validationResult.status },
	);
};

function Verify() {
	const actionData = useActionData<typeof action>();
	const isPending = useIsPending();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo");
	const target = searchParams.get("target");

	const [form, fields] = useForm({
		id: "verify-form",
		constraint: getZodConstraint(VerifySchema),
		defaultValue: { redirectTo, target, otp: "" },
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: VerifySchema });
		},
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
				<Form {...getFormProps(form)}>
					<div className="flex justify-center flex-col gap-4 items-center">
						<InputOTP
							maxLength={6}
							pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
							className="bg-component border border-border"
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
						<Button type="submit" disabled={isPending}>
							Submit
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
}
export default Verify;
