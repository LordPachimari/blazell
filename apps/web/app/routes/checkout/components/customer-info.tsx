import { Input } from "@blazell/ui/input";
import type { User } from "@blazell/validators/client";
import type { CheckoutForm, UpdateCart } from "@blazell/validators";
import { useFormContext } from "react-hook-form";

export const CustomerInfo = ({
	fullName,
	email,
	phone,
	user,
}: {
	fullName: string | null | undefined;
	email: string | null | undefined;
	phone: string | null | undefined;
	user: User | null | undefined;
}) => {
	const { register, formState, clearErrors } = useFormContext<CheckoutForm>();
	return (
		<section>
			<h1 className="text-xl text-mauve-10 my-2">Customer information</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					id="fullName"
					key="fullName"
					placeholder="Full name"
					state={formState.errors.fullName ? "error" : "neutral"}
					stateText={formState.errors.fullName?.message}
					// defaultValue={fullName ?? ""}
					{...register("fullName")}
					onChange={(e) => {
						register("fullName").onChange(e);
						clearErrors();
					}}
				/>
				{!user && (
					<Input
						id="email"
						type="email"
						defaultValue={email ?? ""}
						autoCapitalize="none"
						autoCorrect="off"
						placeholder="Email"
						state={formState.errors.email ? "error" : "neutral"}
						stateText={formState.errors.email?.message}
						{...register("email")}
						onChange={(e) => {
							register("email").onChange(e);
							clearErrors();
						}}
					/>
				)}
				<Input
					id="phone"
					defaultValue={phone ?? ""}
					autoCapitalize="none"
					autoCorrect="off"
					placeholder="Phone"
					state={formState.errors.phone ? "error" : "neutral"}
					stateText={formState.errors.phone?.message}
					{...register("phone")}
					onChange={(e) => {
						register("phone").onChange(e);
						clearErrors();
					}}
				/>
			</div>
		</section>
	);
};
