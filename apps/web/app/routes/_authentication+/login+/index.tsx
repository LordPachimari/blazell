import { Button } from "@blazell/ui/button";
import { Input } from "@blazell/ui/input";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { Link, useFetcher, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { useIsPending } from "~/hooks/use-is-pending";
import { checkHoneypot } from "~/server/honeypot.server";

import { LoadingSpinner } from "@blazell/ui/loading";
import { EmailSchema } from "@blazell/validators";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import { Effect } from "effect";
import { useCallback } from "react";
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
	return await Effect.runPromise(
		HttpClientRequest.post(`${origin}/api/auth/prepare-verification`)
			.pipe(
				HttpClientRequest.jsonBody({
					email: submission.value.email,
					...(submission.value.redirectTo && {
						redirectTo: submission.value.redirectTo,
					}),
				}),
				Effect.andThen(HttpClient.fetchOk),
				Effect.scoped,
			)
			.pipe(
				Effect.catchAll((error) =>
					Effect.sync(() => {
						console.error(error.reason, error.toString());
						const url = new URL(`${origin}/error`);
						url.searchParams.set(
							"error",
							"Something went wrong. Please try again later.",
						);
						return redirect(url.toString());
					}),
				),
				Effect.zipRight(
					Effect.sync(() => {
						const url = new URL(`${origin}/verify`);
						url.searchParams.set("target", submission.value.email);
						submission.value.redirectTo &&
							url.searchParams.set("redirectTo", submission.value.redirectTo);
						return redirect(url.toString());
					}),
				),
			),
	);
}
const Login = () => {
	const isPending = useIsPending();
	const fetcher = useFetcher();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo");
	const [form, fields] = useForm({
		id: "login-form",
		constraint: getZodConstraint(schema),
		defaultValue: { redirectTo, email: "" },
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

	const isEmailSubmitting = fetcher.state === "submitting";

	const isGoogleSubmitting = fetcher.state === "submitting";

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
				<fetcher.Form method="POST" {...getFormProps(form)}>
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Input
								placeholder="email@example.com"
								{...getInputProps(fields.email, { type: "email" })}
							/>
						</div>
						<Button
							type="submit"
							className="w-full text-sm font-body"
							disabled={isPending || isEmailSubmitting}
						>
							{(isPending || isEmailSubmitting) && (
								<LoadingSpinner className="text-white size-4 mr-2" />
							)}
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
					</div>
				</fetcher.Form>

				<Button
					type="button"
					variant="outline"
					className="w-full font-body text-slate-11 text-sm"
					onClick={onGoogleClick}
					disabled={isPending || isGoogleSubmitting}
				>
					{(isPending || isGoogleSubmitting) && (
						<LoadingSpinner className="text-slate-11 size-4 mr-2" />
					)}
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
		</div>
	);
};
export default Login;
