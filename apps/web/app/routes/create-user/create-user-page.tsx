import { useState } from "react";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@pachi/ui/button";
import { Card, CardContent, CardHeader } from "@pachi/ui/card";
import { Input } from "@pachi/ui/input";
import { ScrollArea } from "@pachi/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@pachi/ui/select";
import {
	FormResponseSchema,
	ISO_1666,
	type CreateUser,
} from "@pachi/validators";
import { useNavigate } from "@remix-run/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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

export default CreateUserPage;
