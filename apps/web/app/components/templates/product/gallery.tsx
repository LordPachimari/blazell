import { cn } from "@blazell/ui";

import { useIsWindowScrolled } from "~/hooks/use-is-window-scrolled";
import { useGalleryState } from "~/zustand/state";
import type { Image as ImageType } from "@blazell/validators";
import { ParallaxContainer } from "@blazell/ui/parallax-container";
import { Button } from "@blazell/ui/button";
import { Icons } from "@blazell/ui/icons";
import { AspectRatio } from "@blazell/ui/aspect-ratio";
import { Card, CardContent } from "@blazell/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@blazell/ui/carousel";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import Image from "~/components/molecules/image";
import { toImageURL } from "~/utils/helpers";

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
			{images.map(({ id, url, base64, name, uploaded, fileType }) => (
				<div
					key={id}
					className={"relative  w-full max-h-[calc(100vh-30vh)] rounded-xl"}
					onClick={() => setOpened(!opened)}
					onKeyDown={({ key }) => setOpened(opened && !(key === "Escape"))}
				>
					<Card className="flex items-center p-4 h-fit justify-center">
						{!uploaded ? (
							<img
								alt={name}
								className="rounded-xl border"
								src={toImageURL(base64, fileType)}
							/>
						) : (
							<Image src={url} fit="contain" className="rounded-xl" />
						)}
					</Card>
				</div>
			))}
		</aside>
	);
}

function GalleryForMobileDevices({ images }: GalleryProps) {
	const isScrolled = useIsWindowScrolled();
	const { opened, setOpened } = useGalleryState();

	return (
		<ParallaxContainer className="lg:hidden">
			<section className="aspect-square w-full col-span-4 md:p-4 xs:p-2 p-1  ">
				<Carousel>
					<CarouselContent>
						{images.length > 0 &&
							images.map(({ uploaded, base64, url, name, id, fileType }) => (
								<CarouselItem key={id} className="aspect-square">
									<Card>
										<AspectRatio
											ratio={4 / 5}
											className={"w-full rounded-xl"}
											onClick={() => setOpened(!opened)}
											onKeyDown={({ key }) =>
												setOpened(opened && !(key === "Escape"))
											}
										>
											{!uploaded ? (
												<img
													alt={name}
													className="rounded-xl border"
													src={toImageURL(base64, fileType)}
												/>
											) : (
												<Image src={url} />
											)}
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
