import { Button } from "@blazell/ui/button";
import { Input } from "@blazell/ui/input";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import {
	Form,
	Link,
	useActionData,
	useFetcher,
	useSearchParams,
} from "@remix-run/react";
import { z } from "zod";
import { useIsPending } from "~/hooks/use-is-pending";
import { checkHoneypot } from "~/server/honeypot.server";

import { EmailSchema } from "@blazell/validators";
import { useCallback } from "react";
import { getHonoClient } from "server";
const schema = z.object({
	email: EmailSchema,
	redirectTo: z.string().optional(),
});
export async function action({ request, context }: ActionFunctionArgs) {
	const formData = await request.formData();
	checkHoneypot(formData, context.cloudflare.env.HONEYPOT_SECRET);
	const submission = parseWithZod(formData, {
		schema,
	});
	if (submission.status !== "success") {
		return json({ result: submission.reply() });
	}
	const url = new URL(request.url);
	const origin = url.origin;
	const honoClient = getHonoClient(origin);
	const result = await honoClient.api.auth["prepare-verification"].$post(
		{
			json: {
				email: submission.value.email,
				...(submission.value.redirectTo && {
					redirectTo: submission.value.redirectTo,
				}),
			},
		},
		{
			headers: {
				credentials: "include",
			},
		},
	);

	if (result.ok) {
		const json = await result.json();
		return redirect(json.verifyURL);
	}
	return json(
		{
			result: submission.reply({
				fieldErrors: {
					email: ["Something went wrong. Please try again later."],
				},
			}),
		},
		{ status: result.status },
	);
}
const Login = () => {
	const actionData = useActionData<typeof action>();
	const isPending = useIsPending();
	const fetcher = useFetcher();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo");
	const [form, fields] = useForm({
		id: "login-form",
		constraint: getZodConstraint(schema),
		defaultValue: { redirectTo, email: "" },
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema });
		},
	});
	const onGoogleClick = useCallback(() => {
		return fetcher.submit(
			{},
			{
				method: "POST",
				action: "/google/login",
			},
		);
	}, [fetcher.submit]);

	return (
		<div className="flex items-center h-full justify-center py-12">
			<div className="mx-auto grid w-[350px] gap-6">
				<div className="grid gap-2 text-center">
					<h1 className="text-3xl font-freeman">
						Welcome to{" "}
						<span className="text-balance bg-gradient-to-b from-brand-9 to-brand-11 bg-clip-text font-bold text-transparent lg:tracking-tight ">
							Blazell
						</span>
					</h1>
				</div>
				<Form method="POST" {...getFormProps(form)}>
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Input
								placeholder="email@example.com"
								autoFocus
								{...getInputProps(fields.email, { type: "email" })}
							/>
						</div>
						<Button
							type="submit"
							className="w-full text-sm font-body"
							disabled={isPending}
							onClick={onGoogleClick}
						>
							Continue with email
						</Button>
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</div>
						<Button
							variant="outline"
							className="w-full font-body text-slate-11 text-sm"
						>
							Google
						</Button>
						<p className="px-8 text-center text-sm text-muted-foreground">
							By clicking continue, you agree to our{" "}
							<Link
								to="/terms"
								className="underline underline-offset-4 hover:text-primary"
							>
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link
								to="/privacy"
								className="underline underline-offset-4 hover:text-primary"
							>
								Privacy Policy
							</Link>
							.
						</p>
					</div>
				</Form>
			</div>
		</div>
	);
};
export default Login;
