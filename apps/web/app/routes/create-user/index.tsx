import type { User } from "@blazell/validators/client";
import { useUser } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { json, redirect, type LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { useState } from "react";

import { Button } from "@blazell/ui/button";
import { Card, CardContent, CardHeader } from "@blazell/ui/card";
import { Input } from "@blazell/ui/input";
import { ScrollArea } from "@blazell/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@blazell/ui/select";
import {
	FormResponseSchema,
	ISO_1666,
	type CreateUser,
} from "@blazell/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@remix-run/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@blazell/ui/toast";

type LoaderData = {
	authID: string;
};
export const loader: LoaderFunction = async (args) => {
	const { getToken, userId } = await getAuth(args);
	if (!userId) return redirect("/sign-up");
	const token = await getToken();
	const user = await fetch(`${args.context.env.WORKER_URL}/users`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}).then((res) => res.json() as Promise<User | undefined>);
	if (user) {
		return redirect("/dashboard");
	}
	return json({
		authID: userId,
	});
};
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
		if (!email || !authID) return navigate("/sign-up");
		setIsLoading(true);

		const exist = await fetch(
			`${window.ENV.WORKER_URL}/users/${value.username}`,
		).then((res) => res.json());
		console.log("exist", exist);
		if (exist) {
			toast.error("Username already exists!");
			setIsLoading(false);
			return;
		}

		const result = await fetch(`${window.ENV.WORKER_URL}/users/create-user`, {
			method: "POST",
			body: JSON.stringify({
				user: {
					email,
					username: value.username,
					authID,
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
		<div className="flex h-screen w-screen items-center justify-center bg-brand-0 dark:bg-mauve-a4">
			<Card className="h-fit w-full bg-white drop-shadow-md dark:border-[1px] dark:border-slate-6 dark:bg-mauve-3 md:w-96 mx-4">
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
											{Object.entries(ISO_1666).map(([code, name]) => (
												<SelectItem key={code} value={code}>
													{name}
												</SelectItem>
											))}
										</ScrollArea>
									</SelectContent>
								</Select>
							)}
						/>

						<div className="flex w-full justify-end pt-4">
							<Button type="submit" disabled={isLoading}>
								Finish
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
