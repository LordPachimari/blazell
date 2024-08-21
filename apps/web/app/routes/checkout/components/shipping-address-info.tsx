import { Input } from "@blazell/ui/input";
import { ScrollArea } from "@blazell/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@blazell/ui/select";
import { ISO_1666, type ShippingAddress } from "@blazell/validators";
import {
	getInputProps,
	getSelectProps,
	useField,
	type FieldName,
} from "@conform-to/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { FieldErrorMessage } from "~/components/field-error";

export const ShippingAddressInfo = ({
	fields,
}: {
	fields: {
		shippingAddress: FieldName<ShippingAddress>;
	};
}) => {
	const [parent] = useAutoAnimate({ duration: 100 });
	const [meta, form] = useField(fields.shippingAddress);
	const address = meta.getFieldset();

	return (
		<section ref={parent}>
			<h1 className="text-xl text-slate-10 my-2">Shipping address</h1>

			<FieldErrorMessage message={form.errors?.[0]} />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					placeholder="Address line 1"
					{...getInputProps(address.line1, { type: "text" })}
				/>
				<Input
					placeholder="Address line 2"
					{...getInputProps(address.line2, { type: "text" })}
				/>
				{/* @ts-ignore */}
				<Select {...getSelectProps(address.countryCode)}>
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

				<div>
					<Input
						placeholder="City"
						{...getInputProps(address.city, { type: "text" })}
					/>
				</div>
				<div>
					<Input
						placeholder="Postal code"
						{...getInputProps(address.postalCode, { type: "text" })}
					/>
				</div>
				<div>
					<Input
						placeholder="Province"
						{...getInputProps(address.state, { type: "text" })}
					/>
				</div>
			</div>
		</section>
	);
};
