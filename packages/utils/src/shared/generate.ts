import { ulid } from "ulidx";

const prefixes = [
	"address",
	"user",
	"product",
	"tag",
	"collection",
	"category",
	"variant",
	"p_option",
	"p_op_val",
	"price",
	"cart",
	"img",
	"unauth",
	"store",
	"error",
	"space",
	"line_item",
	"order",
	"notification",
	"verification",
	"session",
] as const;

export type Prefix = (typeof prefixes)[number];

export const generateID = ({
	prefix,
}: { prefix: (typeof prefixes)[number] }) => {
	return `${prefix}_${ulid()}`;
};

export function generateBoundary() {
	const boundary = "--------------------------";
	const randomBytes = new Uint8Array(16);
	crypto.getRandomValues(randomBytes);
	return (
		boundary +
		randomBytes.reduce(
			(str, byte) => str + byte.toString(16).padStart(2, "0"),
			"",
		)
	);
}
