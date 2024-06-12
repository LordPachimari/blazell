import type { User } from "@blazell/validators/client";
import { useUser } from "@clerk/remix";
// import { getAuth } from "@clerk/remix/ssr.server";
import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunction,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";

import { useMemo, useState } from "react";

import { Button } from "@blazell/ui/button";
import { CardContent, CardHeader } from "@blazell/ui/card";
import { Input } from "@blazell/ui/input";
import { ScrollArea } from "@blazell/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@blazell/ui/select";
import { ShineBorder } from "@blazell/ui/shine-border";
import { toast } from "@blazell/ui/toast";
import { generateID } from "@blazell/utils";
import {
	FormResponseSchema,
	ISO_1666,
	type CreateUser,
} from "@blazell/validators";
import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@remix-run/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FieldErrorMessage } from "~/components/field-error";
import { userContext } from "~/sessions.server";

type LoaderData = {
	authID: string;
};
export const loader: LoaderFunction = async (args) => {
	const cookieHeader = args.request.headers.get("Cookie");
	const userContextCookie = (await userContext.parse(cookieHeader)) || {};
	// const { getToken, userId } = await getAuth(args);
	// if (!userId) return redirect("/sign-up");
	// const token = await getToken();
	const user = await fetch(`${args.context.cloudflare.env.WORKER_URL}/users`, {
		method: "GET",
		headers: {
			// Authorization: `Bearer ${token}`,
			"x-fake-auth-id": userContextCookie.fakeAuthID,
		},
	}).then((res) => res.json() as Promise<User | undefined>);
	if (user) {
		return redirect("/dashboard");
	}
	return json({
		// authID: userId,
	});
};
export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await userContext.parse(cookieHeader)) || {};
	const formData = await request.formData();

	const submission = parseWithZod(formData, {
		schema: z.object({
			fakeAuthID: z.string(),
		}),
	});
	invariantResponse(
		submission.status === "success",
		"Invalid fake auth received",
	);
	cookie.fakeAuthID = submission.value.fakeAuthID;
	return json(
		{ result: submission.reply() },
		{
			headers: {
				"Set-Cookie": await userContext.serialize(cookie, {
					maxAge: 31536000,
					path: "/",
					httpOnly: true,
				}),
			},
		},
	);
}

export default function Page() {
	const data = useLoaderData<LoaderData>();
	const { user } = useUser();
	return (
		<CreateUserPage
			authID={data.authID}
			email={user?.emailAddresses[0]?.emailAddress}
		/>
	);
}

interface CreateUserFormState {
	username: string;
	countryCode: string;
}

interface CreateUserPageProps {
	email: string | undefined;
	authID: string | null;
}
function CreateUserPage({ email, authID }: CreateUserPageProps) {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const fetcher = useFetcher();
	const countries = useMemo(() => Object.entries(ISO_1666), []);

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateUserFormState>({
		resolver: zodResolver(
			z.object({
				username: z.string().min(3),
				countryCode: z.string().max(2).min(2),
			}),
		),
	});

	async function onSubmit(value: CreateUserFormState) {
		// if (!email || !authID) return navigate("/sign-up");
		setIsLoading(true);

		const exist = await fetch(
			`${window.ENV.WORKER_URL}/users/${value.username}`,
		).then((res) => res.json());
		if (exist) {
			toast.error("Username already exists!");
			setIsLoading(false);
			return;
		}
		const fakeAuthID = generateID({ prefix: "user" });
		fetcher.submit(
			{
				fakeAuthID,
			},
			{
				method: "POST",
				navigate: false,
				preventScrollReset: true,
				action: "/create-user",
				fetcherKey: "create-user",
			},
		);
		const result = await fetch(`${window.ENV.WORKER_URL}/users/create-user`, {
			method: "POST",
			body: JSON.stringify({
				user: {
					email: email ?? `${value.username}@fake.com`,
					username: value.username,
					authID: authID ?? fakeAuthID,
				},
				countryCode: value.countryCode,
			} satisfies CreateUser),
		})
			.then((res) => res.json())
			.then(FormResponseSchema.parse);

		if (result.type === "ERROR") {
			toast.error(result.message);
			return setIsLoading(false);
		}
		toast.success("User created successfully!");
		navigate("/dashboard/store");

		setIsLoading(false);
	}

	return (
		<div className="flex h-screen w-screen px-2 items-center justify-center bg-brand-0 dark:bg-mauve-a4">
			<ShineBorder
				color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
				className="w-full sm:w-[500px] border border-mauve-7 p-0 "
				borderRadius={20}
			>
				<div className="w-full h-full bg-component p-6 rounded-3xl">
					<CardHeader className="text-md font-freeman pb-0 justify-center items-center font-bold text-3xl">
						Start
					</CardHeader>
					<CardContent className="pt-0">
						<form className="grid w-full" onSubmit={handleSubmit(onSubmit)}>
							<label htmlFor="username" className="sr-only">
								Username
							</label>
							<Input
								className="my-3"
								id="username"
								type="username"
								autoCapitalize="none"
								autoComplete="username"
								autoCorrect="off"
								disabled={isLoading}
								placeholder="Enter username..."
								{...register("username")}
							/>
							{errors?.username && (
								<p className="px-1 text-xs text-ruby-9">
									{errors.username.message}
								</p>
							)}
							<label htmlFor="username" className="sr-only">
								Country
							</label>
							<Controller
								name="countryCode"
								control={control}
								render={({ field }) => (
									<Select
										{...field}
										onValueChange={(value) => field.onChange(value)}
									>
										<SelectTrigger className="my-3">
											<SelectValue placeholder="Country" />
										</SelectTrigger>
										<SelectContent>
											<ScrollArea className="h-[300px]">
												{countries.map(([code, name]) => (
													<SelectItem key={code} value={code}>
														{name}
													</SelectItem>
												))}
											</ScrollArea>
										</SelectContent>
									</Select>
								)}
							/>
							<FieldErrorMessage
								message={errors.countryCode?.message}
								className="px-1"
							/>

							<div className="flex w-full justify-center pt-4">
								<Button
									type="submit"
									className="w-[200px] rounded-xl"
									disabled={isLoading}
								>
									Finish
								</Button>
							</div>
						</form>
					</CardContent>
				</div>
			</ShineBorder>
		</div>
	);
}
