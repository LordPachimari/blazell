import { cn } from "@blazell/ui";
import React from "react";
import ImagePlaceholder from "./image-placeholder";

type Fit = "cover" | "contain" | "fill" | "inside" | "outside";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const Image = React.forwardRef<
	HTMLImageElement,
	React.ImgHTMLAttributes<HTMLImageElement> & {
		src: string | undefined;
		width?: number;
		height?: number;
		quality?: number;
		fit?: Fit;
	}
>(({ className, fit, quality, width, height, alt, src, ...props }, ref) => {
	if (!src)
		return (
			<div
				className={cn(
					"flex aspect-square h-20 w-20 bg-component max-w-full rounded-lg justify-center items-center",
					className,
				)}
			>
				<ImagePlaceholder />
			</div>
		);

	if (!src.startsWith("http")) {
		// biome-ignore lint/a11y/useAltText: <explanation>
		return (
			<img ref={ref} alt={alt} className={cn(className)} src={src} {...props} />
		);
	}

	const params = new URLSearchParams();

	if (fit) {
		params.append("fit", fit);
	}

	if (width) {
		params.append("width", width.toString());
	}

	if (height) {
		params.append("height", height.toString());
	}
	if (quality) {
		params.append("quality", quality.toString());
	}

	params.append("image", src);
	const MEDIA_URL =
		"https://blazell-media-development.pachimari.workers.dev/transform";

	const url = new URL(MEDIA_URL);
	url.search = params.toString();
	if (!fit && !width && !height) {
		return (
			// biome-ignore lint/a11y/useAltText: <explanation>
			<img ref={ref} alt={alt} className={cn(className)} src={src} {...props} />
		);
	}
	const imageSrc = url.toString();

	return (
		// biome-ignore lint/a11y/useAltText: <explanation>
		<img
			ref={ref}
			alt={alt}
			className={cn(className)}
			src={imageSrc}
			{...props}
		/>
	);
});

export default Image;
