import { Input } from "@blazell/ui/input";
import type { User } from "@blazell/validators/client";
import { getInputProps, useField, type FieldName } from "@conform-to/react";
import { FieldErrorMessage } from "~/components/field-error";

export const CustomerInfo = ({
	user,
	fields,
}: {
	user: User | null | undefined;
	fields: {
		email: FieldName<string>;
		fullName: FieldName<string>;
		phone: FieldName<string>;
	};
}) => {
	const [fullNameMeta, form] = useField(fields.fullName);
	const [emailMeta] = useField(fields.email);
	const [phoneMeta] = useField(fields.phone);

	return (
		<section>
			<h1 className="text-xl text-slate-10 my-2">Customer information</h1>

			<FieldErrorMessage message={form.errors?.[0]} />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
				<Input
					placeholder="Full name"
					{...getInputProps(fullNameMeta, { type: "text" })}
				/>
				{!user && (
					<Input
						placeholder="Email"
						{...getInputProps(emailMeta, { type: "email" })}
					/>
				)}
				<Input
					placeholder="Phone"
					{...getInputProps(phoneMeta, { type: "text" })}
				/>
			</div>
		</section>
	);
};
