import { Avatar, AvatarFallback, AvatarImage } from "@blazell/ui/avatar";
import { EditStore } from "./edit-store";
import { truncateString } from "@blazell/utils";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@blazell/ui/dialog";
import { useState } from "react";
import { Button } from "@blazell/ui/button";
import type { Store } from "@blazell/validators/client";
import Image from "~/components/molecules/image";
import { ClientOnly } from "remix-utils/client-only";
import { toImageURL } from "~/utils/helpers";
import ImagePlaceholder from "~/components/molecules/image-placeholder";

export function StoreInfo({
	store,
	productCount,
}: { store: Store | undefined | null; productCount: number }) {
	const [aboutOpen, setAboutOpen] = useState(false);
	console.log("store", store);
	console.log("url", store?.storeImage?.croppedImage?.url);
	return (
		<section>
			<div className="relative flex h-full  w-full p-0 pt-8 gap-4 ">
				<section className="flex h-full w-full  items-center md:w-[230px]">
					<Avatar className="border-mauve-7 bg-mauve-3 border aspect-square w-full h-full max-w-44 max-h-44 min-w-32 min-h-32">
						{store?.storeImage ? (
							store?.storeImage?.croppedImage?.uploaded ? (
								<Image
									fit="contain"
									quality={100}
									src={store?.storeImage.croppedImage?.url}
									alt="header"
									className="rounded-lg"
									height={210}
								/>
							) : (
								<img
									src={toImageURL(
										store?.storeImage?.croppedImage?.base64,
										store?.storeImage?.croppedImage?.fileType,
									)}
									alt="header"
									className="rounded-lg object-contain"
								/>
							)
						) : (
							<ImagePlaceholder />
						)}
					</Avatar>
				</section>
				<section className="h-full w-full">
					<h1 className="line-clamp-2 font-freeman flex-grow text-2xl font-bold leading-none tracking-tight">
						{store?.name ?? ""}
					</h1>
					<span>
						<h2 className="py-1 text-mauve-11">@{store?.founder?.username}</h2>
					</span>
					<AboutStore
						isOpen={aboutOpen}
						setIsOpen={setAboutOpen}
						store={store}
					/>

					<div className="absolute bottom-0">
						<div className="flex gap-3">
							<h2 className="flex gap-[3px] text-mauve-11 text-sm md:text-base">
								<p className="font-bold text-black dark:text-white">0</p>{" "}
								following
							</h2>
							<h2 className="flex gap-[3px] text-mauve-11 text-sm md:text-base">
								<p className="font-bold text-black dark:text-white">
									{productCount}
								</p>{" "}
								products
							</h2>
						</div>
						{/* <Button className="mt-2">Follow</Button> */}
						{store && (
							<ClientOnly>{() => <EditStore store={store} />}</ClientOnly>
						)}
					</div>
				</section>
			</div>
		</section>
	);
}

const AboutStore = ({
	isOpen,
	setIsOpen,
	store,
}: {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	store: Store | undefined | null;
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger>
				<span className="flex items-center cursor-pointer text-mauve-11">
					<p className="text-ellipsis overflow-hidden">
						{truncateString(store?.description ?? "", 70)}
					</p>
					<Icons.right size={17} strokeWidth={strokeWidth} />
				</span>
			</DialogTrigger>
			<DialogContent className="md:w-[600px] bg-mauve-2">
				<Button
					type="button"
					variant={"ghost"}
					size="icon"
					className="text-mauve-11 absolute top-3 right-3"
					onClick={() => setIsOpen(false)}
				>
					<Icons.close />
				</Button>
				<DialogTitle>About</DialogTitle>
				<p className="text-mauve-11">{store?.description}</p>
			</DialogContent>
		</Dialog>
	);
};
