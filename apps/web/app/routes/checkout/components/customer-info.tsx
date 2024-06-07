import { Input } from "@blazell/ui/input";
import type { CheckoutForm } from "@blazell/validators";
import type { User } from "@blazell/validators/client";
import { useFormContext } from "react-hook-form";
import { FieldErrorMessage } from "~/components/field-error";

export const CustomerInfo = ({
	user,
}: {
	user: User | null | undefined;
}) => {
	const { register, formState, clearErrors } = useFormContext<CheckoutForm>();
	return (
		<section>
			<h1 className="text-xl text-mauve-10 my-2">Customer information</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
				<Input
					id="fullName"
					key="fullName"
					placeholder="Full name"
					{...register("fullName")}
					onChange={(e) => {
						register("fullName").onChange(e);
						clearErrors();
					}}
				/>
				<FieldErrorMessage message={formState.errors.fullName?.message} />
				{!user && (
					<Input
						id="email"
						type="email"
						autoCapitalize="none"
						autoCorrect="off"
						placeholder="Email"
						{...register("email")}
						onChange={(e) => {
							register("email").onChange(e);
							clearErrors();
						}}
					/>
				)}
				<FieldErrorMessage message={formState.errors.email?.message} />
				<Input
					id="phone"
					autoCapitalize="none"
					autoCorrect="off"
					placeholder="Phone"
					{...register("phone")}
					onChange={(e) => {
						register("phone").onChange(e);
						clearErrors();
					}}
				/>
				<FieldErrorMessage message={formState.errors.phone?.message} />
			</div>
		</section>
	);
};
