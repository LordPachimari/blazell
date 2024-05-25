import type { Image } from "@blazell/db";

export type FileType = (File & { preview?: string }) &
	Omit<Image, "url"> & { url?: string };
