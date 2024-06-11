import { cn } from "@blazell/ui";

import { Card, CardContent } from "@blazell/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@blazell/ui/carousel";
import type { Image as ImageType } from "@blazell/validators";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { useIsWindowScrolled } from "~/hooks/use-is-window-scrolled";
import { toImageURL } from "~/utils/helpers";

interface GalleryProps {
	images: ImageType[];
}

function MobileGallery({ images }: GalleryProps) {
	const isScrolled = useIsWindowScrolled();
	console.log("isScrolled", isScrolled);
	return (
		<div
			className={cn(
				"sticky top-0 lg:hidden h-full transition-all flex flex-col items-center w-full gap-4",
				// isScrolled && "brightness-50 lg:brightness-100",
			)}
		>
			<div className="flex flex-col justify-center items-center w-full gap-4 lg:p-4 h-full">
				<Carousel>
					<CarouselContent className="shadow-none">
						{images.map(({ uploaded, base64, url, name, id, fileType }) => (
							<CarouselItem
								key={id}
								className={cn("shadow-none w-full flex justify-center")}
							>
								{!uploaded ? (
									<img
										alt={name}
										className={cn(
											"md:rounded-xl w-max max-w-full select-none object-contain object-center",
										)}
										src={toImageURL(base64, fileType)}
									/>
								) : (
									<Image
										src={url}
										className={cn(
											"lg:rounded-2xl w-max max-w-full select-none object-contain object-center",
										)}
										quality={100}
										fit="contain"
									/>
								)}
							</CarouselItem>
						))}
						{images.length === 0 && (
							<CarouselItem className="aspect-square">
								<Card className="p-4 relative text-center shadow-none lg:shadow-md border-[0px] lg:border lg:border-mauve-7 height-full cursor-pointer aspect-square">
									<CardContent className="p-0 flex h-full justify-center items-center">
										<ImagePlaceholder size={30} />
									</CardContent>
								</Card>
							</CarouselItem>
						)}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
				</Carousel>
			</div>
		</div>
	);
}

const DesktopGallery = ({ images }: GalleryProps) => {
	return (
		<div className="hidden py-4 lg:flex flex-col w-full gap-4 col-span-5 items-center justify-center h-full overflow-y-scroll">
			{images.map(({ uploaded, base64, url, name, id, fileType }) => {
				if (!uploaded)
					return (
						// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
						<img
							key={id}
							alt={name}
							className={cn(
								"w-max max-w-full select-none object-contain object-center",
							)}
							src={toImageURL(base64, fileType)}
							onClick={(e) => e.stopPropagation()}
						/>
					);
				return (
					<Image
						key={id}
						src={url}
						className={cn(
							"w-max max-w-full select-none object-contain object-center",
						)}
						quality={100}
						fit="contain"
						onClick={(e) => e.stopPropagation()}
					/>
				);
			})}
			{images.length === 0 && (
				<Card className="p-4 relative text-center shadow-none lg:shadow-md border-[0px] lg:border lg:border-mauve-7 height-full cursor-pointer aspect-square">
					<CardContent className="p-0 flex h-full justify-center items-center">
						<ImagePlaceholder size={30} />
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export { DesktopGallery, MobileGallery };
