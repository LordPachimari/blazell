import { cn } from "@blazell/ui";

import { Card, CardContent } from "@blazell/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from "@blazell/ui/carousel";
import type { Image as ImageType } from "@blazell/db";
import React, { useCallback } from "react";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { useIsWindowScrolled } from "~/hooks/use-is-window-scrolled";
import { toImageURL } from "~/utils/helpers";

interface GalleryProps {
	images: ImageType[];
}

function Gallery({ images }: GalleryProps) {
	const [api, setApi] = React.useState<CarouselApi>();
	const onClick = useCallback(
		(index: number) => {
			if (!api) return;
			api.scrollTo(index);
		},
		[api],
	);

	const isScrolled = useIsWindowScrolled();
	console.log("images", images);
	return (
		<div
			className={cn(
				"sticky top-0 lg:relative  transition-all duration-500 ease-in-out col-span-4 w-full min-w-[20rem] lg:max-w-[40rem] gap-4",
				isScrolled && "brightness-50 lg:brightness-100",
			)}
		>
			<div className="flex flex-col gap-4 lg:p-4">
				<Carousel setApi={setApi} className="h-fit">
					<CarouselContent className="shadow-none ">
						{images.length > 0 &&
							images.map(({ uploaded, base64, url, name, id, fileType }) => (
								<CarouselItem
									key={id}
									className={cn("aspect-square shadow-none ")}
								>
									{!uploaded ? (
										<img
											alt={name}
											className={cn(
												"md:rounded-xl lg:border lg:border-mauve-7",
											)}
											src={toImageURL(base64, fileType)}
										/>
									) : (
										<Image
											src={url}
											className={cn(
												"lg:rounded-2xl lg:border lg:border-mauve-7",
											)}
											fit="fill"
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
				<div className="lg:grid lg:grid-cols-5 gap-4 px-4 hidden">
					{images.map(
						({ uploaded, base64, url, name, id, fileType }, index) => (
							<div key={id} className="h-[100px] ">
								{!uploaded ? (
									<button type="button" onClick={() => onClick(index)}>
										<img
											alt={name}
											className={cn(
												"rounded-xl border hover:border-crimson-9 cursor-pointer",
											)}
											src={toImageURL(base64, fileType)}
											onKeyDown={() => onClick(index)}
										/>
									</button>
								) : (
									<button type="button" onClick={() => onClick(index)}>
										<Image
											src={url}
											className={cn(
												"rounded-2xl border hover:border-crimson-9 cursor-pointer",
											)}
											fit="fill"
										/>
									</button>
								)}
							</div>
						),
					)}
				</div>
			</div>
		</div>
	);
}

export { Gallery };
