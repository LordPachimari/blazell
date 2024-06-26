import { motion } from "framer-motion";
import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@blazell/ui/button";
import { Input } from "@blazell/ui/input";
import { ScrollArea } from "@blazell/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@blazell/ui/select";
import { toast } from "@blazell/ui/toast";
import { generateID } from "@blazell/utils";
import {
	FormResponseSchema,
	type CreateUser as CreateUserType,
} from "@blazell/validators";
import { useFetcher, useNavigate } from "@remix-run/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FieldErrorMessage } from "~/components/field-error";
import { StepHeader } from "./step-header";

interface CreateUserFormState {
	username: string;
	countryCode: string;
}

interface CreateUserProps {
	email: string | undefined;
	authID: string | null;
}

export function CreateUser({ authID, email }: CreateUserProps) {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const fetcher = useFetcher();
	// const countries = React.useMemo(() => Object.entries(ISO_1666), []);

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
			`${window.ENV.WORKER_URL}/users/username/${value.username}`,
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
				preventScrollReset: true,
				action: "/onboarding",
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
			} satisfies CreateUserType),
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
		<motion.div
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.3, type: "spring" }}
			className="w-screen h-screen bg-background flex justify-center items-center"
		>
			<motion.div
				variants={{
					show: {
						transition: {
							staggerChildren: 0.2,
						},
					},
				}}
				initial="hidden"
				animate="show"
				className="flex flex-col space-y-4 rounded-xl max-w-lg bg-background/60 p-8"
			>
				<StepHeader
					title="Create your username"
					description="You store will have the same name as your username. You can update it later."
				/>
				<motion.div
					variants={{
						hidden: { opacity: 0, x: 100 },
						show: {
							opacity: 1,
							x: 0,
							transition: { duration: 0.4, type: "spring" },
						},
					}}
				>
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
							<p className="px-1 text-xs text-red-9">
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
										<ScrollArea>
											<SelectItem key={"AU"} value={"AU"}>
												Australia
											</SelectItem>
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
								className="w-full rounded-xl"
								disabled={isLoading}
							>
								Create user
							</Button>
						</div>
					</form>
				</motion.div>
			</motion.div>
		</motion.div>
	);
}
