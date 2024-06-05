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

export const ShippingAddressInfo = ({
	addressID,
}: {
	addressID: string | undefined | null;
}) => {
	const [parent] = useAutoAnimate({ duration: 100 });

	const { register, formState, control, clearErrors } =
		useFormContext<CheckoutForm>();
	console.log(formState.errors.shippingAddress);

	return (
		<section ref={parent}>
			<h1 className="text-xl text-mauve-10 my-2">Shipping address</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					id="address"
					autoCapitalize="none"
					placeholder="Address"
					state={
						formState.errors.shippingAddress?.address ? "error" : "neutral"
					}
					stateText={formState.errors.shippingAddress?.address?.message}
					{...register("shippingAddress.address")}
					onChange={(e) => {
						register("shippingAddress.address").onChange(e);
						clearErrors();
					}}
				/>

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
							{formState.errors.shippingAddress?.countryCode?.message && (
								<p className="text-xs text-rose-500">Pick country</p>
							)}
						</div>
					)}
				/>
				<Input
					id="city"
					autoCapitalize="none"
					autoCorrect="off"
					state={formState.errors.shippingAddress?.city ? "error" : "neutral"}
					stateText={formState.errors.shippingAddress?.city?.message}
					placeholder="City"
					{...register("shippingAddress.city")}
					onChange={(e) => {
						register("shippingAddress.city").onChange(e);
						clearErrors();
					}}
				/>
				<Input
					id="postalCode"
					autoCapitalize="none"
					autoCorrect="off"
					placeholder="Postal code"
					state={
						formState.errors.shippingAddress?.postalCode ? "error" : "neutral"
					}
					stateText={formState.errors.shippingAddress?.postalCode?.message}
					{...register("shippingAddress.postalCode")}
					onChange={(e) => {
						register("shippingAddress.postalCode").onChange(e);
						clearErrors();
					}}
				/>
				<Input
					id="State/province"
					autoCapitalize="none"
					autoCorrect="off"
					placeholder="State/province"
					state={
						formState.errors.shippingAddress?.province ? "error" : "neutral"
					}
					stateText={formState.errors.shippingAddress?.province?.message}
					{...register("shippingAddress.province")}
					onChange={(e) => {
						register("shippingAddress.province").onChange(e);
						clearErrors();
					}}
				/>
			</div>
		</section>
	);
};
