import { Avatar } from "@blazell/ui/avatar";
import { Button } from "@blazell/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@blazell/ui/dialog";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import { Skeleton } from "@blazell/ui/skeleton";
import type { Store } from "@blazell/validators/client";
import { useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { toImageURL } from "~/utils/helpers";
import { EditStore } from "./edit-store";
import { cn } from "@blazell/ui";

export function StoreInfo({
	store,
	productCount,
	isInitialized,
	size = "base",
}: {
	store: Store | undefined;
	productCount: number;
	isInitialized: boolean;
	size?: "small" | "base";
}) {
	const [aboutOpen, setAboutOpen] = useState(false);
	return (
		<section>
			<div
				className={cn(
					"relative flex h-full items-center w-full p-0 pt-8 gap-4 ",
					{ "pt-2": size === "small" },
				)}
			>
				<section
					className={cn("flex h-full items-center md:w-[230px]", {
						"md:w-[13Z0px]": size === "small",
					})}
				>
					<Avatar
						className={cn(
							"border-border   bg-slate-3 border aspect-square w-full h-full max-w-44 max-h-44 min-w-32 min-h-32",
							{ "max-w-24 max-h-24 min-w-20 min-h-20": size === "small" },
						)}
					>
						{store?.storeImage ? (
							store?.storeImage?.croppedImage?.uploaded ? (
								<Image
									fit="cover"
									src={store?.storeImage.croppedImage?.url}
									alt="store"
									className="rounded-lg"
									height={size === "small" ? 150 : 210}
								/>
							) : (
								<img
									src={toImageURL(
										store?.storeImage?.croppedImage?.base64,
										store?.storeImage?.croppedImage?.fileType,
									)}
									alt="store"
									className="rounded-lg object-cover"
								/>
							)
						) : (
							<ImagePlaceholder />
						)}
					</Avatar>
				</section>
				<section className="h-full w-full">
					{!isInitialized ? (
						<div className="flex flex-col gap-2">
							<Skeleton className="w-[100px] h-[15px]" />
							<Skeleton className="w-[100px] mt-1 h-[15px]" />
						</div>
					) : (
						<div className="flex flex-col">
							<h1
								className={cn(
									"line-clamp-2 font-freeman flex-grow text-2xl font-bold leading-none tracking-tight",
									{ "text-lg": size === "small" },
								)}
							>
								{store?.name ?? ""}
							</h1>
							<span>
								<h2
									className={cn("py-1 text-slate-11", {
										"text-sm": size === "small",
									})}
								>
									@{store?.founder?.username}
								</h2>
							</span>
						</div>
					)}
					<AboutStore
						isOpen={aboutOpen}
						setIsOpen={setAboutOpen}
						store={store}
						isInitialized={!!isInitialized}
					/>

					<div className={cn("pt-4", { "pt-2": size === "small" })}>
						<div className="flex gap-3 flex-wrap">
							{!isInitialized ? (
								<>
									<Skeleton className="w-[100px] h-[15px]" />
									<Skeleton className="w-[100px] h-[15px]" />
								</>
							) : (
								<>
									<h2
										className={cn(
											"flex gap-[3px] text-slate-11 text-sm md:text-base",
											{ "md:text-sm": size === "small" },
										)}
									>
										<p className="font-bold text-black dark:text-white">0</p>{" "}
										following
									</h2>
									<h2
										className={cn(
											"flex gap-[3px] text-slate-11 text-sm md:text-base",
											{ "md:text-sm": size === "small" },
										)}
									>
										<p className="font-bold text-black dark:text-white">
											{productCount}
										</p>{" "}
										products
									</h2>
								</>
							)}
						</div>
						{/* <Button className="mt-2">Follow</Button> */}
						{store && size === "base" && (
							<ClientOnly>{() => <EditStore store={store} />}</ClientOnly>
						)}
						{!store && size === "base" && (
							<Button variant="ghost" className="mt-2">
								Edit store
							</Button>
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
	isInitialized,
}: {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	store: Store | undefined | null;
	isInitialized: boolean;
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger>
				<span className="flex items-center cursor-pointer text-slate-11">
					{!isInitialized ? (
						<Skeleton className="w-[300px] h-[10px]" />
					) : (
						<p className="line-clamp-1">{store?.description ?? ""}</p>
					)}

					<Icons.Right size={17} strokeWidth={strokeWidth} />
				</span>
			</DialogTrigger>
			<DialogContent className="md:w-[600px]">
				<Button
					type="button"
					variant={"ghost"}
					size="icon"
					className="text-slate-11 absolute rounded-full top-3 right-3"
					onClick={() => setIsOpen(false)}
				>
					<Icons.Close />
				</Button>
				<DialogTitle>About</DialogTitle>
				<p className="text-slate-11">{store?.description}</p>
			</DialogContent>
		</Dialog>
	);
};
