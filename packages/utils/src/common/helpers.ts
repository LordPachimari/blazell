import dayjs from "dayjs";
import type { Image } from "@pachi/validators";

export function formatPrice(price: number | string) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(Number(price));
}

export function formatDate(date: Date) {
	return dayjs(date).format("MMMM D, YYYY");
}

export function formatBytes(
	bytes: number,
	decimals = 0,
	sizeType: "accurate" | "normal" = "normal",
) {
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];

	if (bytes === 0) return "0 Byte";
	const i = Math.floor(Math.log(bytes) / Math.log(1024));

	return `${(bytes / 1024 ** i).toFixed(decimals)} ${
		sizeType === "accurate" ? accurateSizes[i] ?? "Bytest" : sizes[i] ?? "Bytes"
	}`;
}

export function slugify(str: string) {
	return str
		.toLowerCase()
		.replace(/ /g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/--+/g, "-");
}

export function unslugify(str: string) {
	return str.replace(/-/g, " ");
}

export function toTitleCase(str: string) {
	return str.replace(
		/\w\S*/g,
		(txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase(),
	);
}

export function toSentenceCase(str: string) {
	return str
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase());
}

export function isArrayOfFile(files: unknown): files is File[] {
	const isArray = Array.isArray(files);

	if (!isArray) return false;

	return files.every((file) => file instanceof File);
}
export type Money = {
	amount: number;
	currencyCode: string;
};
const noDivisionCurrencies = ["krw", "jpy", "vnd"];

export const convertToDecimal = (amount: number, currencyCode = "USD") => {
	const divisor = noDivisionCurrencies.includes(currencyCode.toLowerCase())
		? 1
		: 100;

	return Math.floor(amount) / divisor;
};

export function removeDuplicateImages(arr: Image[]) {
	const map = new Map<string, Image>();
	for (const image of arr) {
		const existingImage = map.get(image.id);
		if (existingImage?.preview) {
			map.delete(existingImage.id);
		}
		map.set(image.id, image);
	}
	return Array.from(map.values()).sort((a, b) => a.order - b.order);
}
