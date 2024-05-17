"use client";

import { cn } from "@pachi/ui";

import { useIsWindowScrolled } from "~/hooks/use-is-window-scrolled";
import { useGalleryState } from "~/zustand/state";
import type { Image as ImageType } from "@pachi/validators";
import { ParallaxContainer } from "@pachi/ui/parallax-container";
import { Button } from "@pachi/ui/button";
import { Icons } from "@pachi/ui/icons";
import { AspectRatio } from "@pachi/ui/aspect-ratio";
import { Card, CardContent } from "@pachi/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@pachi/ui/carousel";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { Image } from "~/components/image";

interface GalleryProps {
	images: ImageType[];
}

function Gallery({ images }: GalleryProps) {
	return (
		<>
			<GalleryForDesktop images={images} />
			<GalleryForMobileDevices images={images} />
			<CloseFullScreenGalleryButton />
		</>
	);
}

function GalleryForDesktop({ images }: GalleryProps) {
	const { opened, setOpened } = useGalleryState();

	return (
		<aside
			className={cn(
				"hidden lg:grid col-span-4 min-w-[20rem] max-w-[45rem] lg:max-w-[40rem] gap-4",
			)}
		>
			{images.map(({ id, url, preview, name }) => (
				<AspectRatio
					ratio={2 / 3}
					key={id}
					className={"relative  w-full max-h-[calc(100vh-30vh)] rounded-xl"}
					onClick={() => setOpened(!opened)}
					onKeyDown={({ key }) => setOpened(opened && !(key === "Escape"))}
				>
					<Card className="flex items-center p-4 h-full justify-center">
						<Image
							alt={name}
							className="rounded-xl border"
							fit="fill"
							sizes="20rem"
							src={preview ?? url ?? ""}
						/>
					</Card>
				</AspectRatio>
			))}
		</aside>
	);
}

function GalleryForMobileDevices({ images }: GalleryProps) {
	const isScrolled = useIsWindowScrolled();
	const { opened, setOpened } = useGalleryState();

	return (
		<ParallaxContainer className="lg:hidden">
			<section className="aspect-square w-full  col-span-4 md:p-4 xs:p-2 p-1  ">
				<Carousel>
					<CarouselContent>
						{images.length > 0 &&
							images.map((image) => (
								<CarouselItem key={image.id} className="aspect-square">
									<Card>
										<AspectRatio
											ratio={4 / 5}
											className={"w-full rounded-xl"}
											onClick={() => setOpened(!opened)}
											onKeyDown={({ key }) =>
												setOpened(opened && !(key === "Escape"))
											}
										>
											<Image
												alt={image.name}
												className="rounded-xl"
												fit="fill"
												sizes="20rem"
												src={image.preview ?? image.url ?? ""}
											/>
										</AspectRatio>
									</Card>
								</CarouselItem>
							))}
						{images.length === 0 && (
							<CarouselItem className="aspect-square">
								<Card className="p-4 relative text-center shadow-md height-full cursor-pointer aspect-square">
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
			</section>
		</ParallaxContainer>
	);
}

function CloseFullScreenGalleryButton() {
	const { opened, setOpened } = useGalleryState();

	return (
		opened && (
			<Button
				className="fixed right-0 top-0 z-20 m-2"
				size="icon"
				title="CLose"
				variant="ghost"
				onClick={() => setOpened(false)}
			>
				<Icons.close color="black" size={50} strokeWidth={0.5} />
				<span className="sr-only">Close gallery</span>
			</Button>
		)
	);
}

export { Gallery };
