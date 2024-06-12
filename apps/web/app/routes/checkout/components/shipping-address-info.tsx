import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ISO_1666, type CheckoutForm } from "@blazell/validators";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@blazell/ui/input";
import { ScrollArea } from "@blazell/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@blazell/ui/select";
import { FieldErrorMessage } from "~/components/field-error";

export const ShippingAddressInfo = () => {
	const [parent] = useAutoAnimate({ duration: 100 });

	const { register, formState, control, clearErrors } =
		useFormContext<CheckoutForm>();
	console.log(formState.errors.shippingAddress);

	return (
		<section ref={parent}>
			<h1 className="text-xl text-mauve-10 my-2">Shipping address</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Input
						id="address"
						autoCapitalize="none"
						placeholder="Address"
						{...register("shippingAddress.address")}
						onChange={(e) => {
							register("shippingAddress.address").onChange(e);
							clearErrors();
						}}
					/>
					<FieldErrorMessage
						message={formState.errors.shippingAddress?.address?.message}
					/>
				</div>

				<Controller
					name="shippingAddress.countryCode"
					control={control}
					render={({ field }) => (
						<div className="relative w-full">
							<Select
								{...field}
								onValueChange={(value) => {
									clearErrors();
									field.onChange(value);
								}}
							>
								<SelectTrigger>
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

							<FieldErrorMessage
								message={formState.errors.shippingAddress?.countryCode?.message}
							/>
						</div>
					)}
				/>
				<div>
					<Input
						id="city"
						autoCapitalize="none"
						autoCorrect="off"
						placeholder="City"
						{...register("shippingAddress.city")}
						onChange={(e) => {
							register("shippingAddress.city").onChange(e);
							clearErrors();
						}}
					/>
					<FieldErrorMessage
						message={formState.errors.shippingAddress?.city?.message}
					/>
				</div>
				<div>
					<Input
						id="postalCode"
						autoCapitalize="none"
						autoCorrect="off"
						placeholder="Postal code"
						{...register("shippingAddress.postalCode")}
						onChange={(e) => {
							register("shippingAddress.postalCode").onChange(e);
							clearErrors();
						}}
					/>
					<FieldErrorMessage
						message={formState.errors.shippingAddress?.postalCode?.message}
					/>
				</div>
				<div>
					<Input
						id="State/province"
						autoCapitalize="none"
						autoCorrect="off"
						placeholder="State/province"
						{...register("shippingAddress.province")}
						onChange={(e) => {
							register("shippingAddress.province").onChange(e);
							clearErrors();
						}}
					/>
					<FieldErrorMessage
						message={formState.errors.shippingAddress?.province?.message}
					/>
				</div>
			</div>
		</section>
	);
};
