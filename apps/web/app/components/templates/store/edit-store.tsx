import { Avatar, AvatarFallback, AvatarImage } from "@pachi/ui/avatar";
import { useCallback, useEffect, useRef, useState } from "react";
import ImagePlaceholder from "~/components/molecules/image-placeholder";

import { useAuth } from "@clerk/remix";
import { cn } from "@pachi/ui";
import { Button } from "@pachi/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@pachi/ui/dialog";
import { Icons } from "@pachi/ui/icons";
import { Input } from "@pachi/ui/input";
import { Label } from "@pachi/ui/label";
import { LoadingSpinner } from "@pachi/ui/loading";
import { Textarea } from "@pachi/ui/textarea";
import { toast } from "@pachi/ui/toast";
import { generateID } from "@pachi/utils";
import type { Store } from "@pachi/validators/client";
import type { Crop, PixelCrop } from "react-image-crop";
import { Image } from "~/components/image";
import { useDebounceEffect } from "~/hooks/use-debounce-effect";
import { useReplicache } from "~/zustand/replicache";
import { canvasPreview } from "./canvas-preview";
import CropImage from "./crop-image";
import type { UpdateStore } from "@pachi/validators";

export function EditStore({ store }: { store: Store | null | undefined }) {
	const [isOpen, setIsOpen_] = useState(false);

	const { getToken } = useAuth();

	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const imgRef = useRef<HTMLImageElement>(null);
	const [headerSrc, setHeaderSrc] = useState<string | null>(null);
	const [storeSrc, setStoreSrc] = useState<string | null>(null);
	const [storeFile, setStoreFile] = useState<File | null>(null);
	const [headerFile, setHeaderFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const [crop, setCrop] = useState<Crop>();

	const clear = useCallback(() => {
		if (headerSrc) {
			if (!headerSrc.startsWith("http")) URL.revokeObjectURL(headerSrc);
		}
		if (crop) setCrop(undefined);

		if (setIsCropOpen) setIsCropOpen(false);
	}, [crop, headerSrc]);
	const setIsOpen = (value: boolean) => {
		if (!value) {
			clear();

			setIsOpen_(value);
		} else {
			setIsOpen_(value);
		}
	};

	const headerInputRef = useRef<HTMLInputElement>(null);
	const headerInputClick = () => {
		headerInputRef.current?.click();
	};
	const storeInputRef = useRef<HTMLInputElement>(null);
	const storeInputClick = () => {
		storeInputRef.current?.click();
	};
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);
	const [isCropOpen, setIsCropOpen] = useState(false);
	const deleteStoreImage = useCallback(async () => {
		if (headerSrc === store?.headerImage?.url) {
			store?.headerImage &&
				(await dashboardRep?.mutate.deleteStoreImage({
					storeID: store.id,
					type: "headerImage",
					imageID: store.headerImage.id,
				}));
			setHeaderSrc(null);
		} else {
			headerSrc && URL.revokeObjectURL(headerSrc);
			store?.headerImage?.url && setHeaderSrc(store.headerImage.url);
		}
	}, [store, dashboardRep, headerSrc]);

	const onHeaderImageChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				setHeaderFile(e.target.files[0]!);
				const fileReader = new FileReader();
				fileReader.onloadend = () => {
					setHeaderSrc(fileReader.result as string);
					setIsCropOpen(true);
				};
				fileReader.readAsDataURL(e.target.files[0]!);
			}
		},
		[],
	);
	const onStoreImageChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files.length > 0) {
				console.log("uploading store image");
				setStoreFile(e.target.files[0]!);
				const fileReader = new FileReader();
				fileReader.onloadend = () => {
					setStoreSrc(fileReader.result as string);
				};
				fileReader.readAsDataURL(e.target.files[0]!);
			}
		},
		[],
	);
	useDebounceEffect(
		async () => {
			console.log(
				!!completedCrop?.width,
				!!completedCrop?.height,
				!!imgRef.current,
				!!previewCanvasRef.current,
			);
			if (
				completedCrop?.width &&
				completedCrop?.height &&
				imgRef.current &&
				previewCanvasRef.current
			) {
				// We use canvasPreview as it's much faster than imgPreview.
				canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);
			}
		},
		100,
		[completedCrop],
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!headerSrc && store?.headerImage?.url) {
			setHeaderSrc(store.headerImage.url);
		}
	}, [store]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!storeSrc && store?.storeImage?.url) {
			setStoreSrc(store.storeImage.url);
		}
	}, [store]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const saveStoreInfo = useCallback(
		async (updates: UpdateStore["updates"]) => {
			if (store && dashboardRep) {
				setIsLoading(true);
				const promises = [
					dashboardRep.mutate.updateStore({
						id: store.id,
						updates,
					}),
				];
				if (crop) promises.push(saveCroppedImage());
				console.log(
					"check",
					storeFile,
					storeSrc,
					storeSrc !== store?.storeImage?.url,
				);
				if (storeFile && storeSrc && storeSrc !== store?.storeImage?.url) {
					promises.push(saveStoreImage());
				}
				await Promise.all(promises);
				clear();
				toast.success("Store updated successfully");
				setIsOpen(false);
				setIsLoading(false);
			}
		},

		[store, dashboardRep, crop, clear, storeSrc, storeFile],
	);
	const saveStoreImage = useCallback(async () => {
		const imageKey = generateID({ prefix: "img" });
		const token = await getToken();
		console.log("saving store image", storeFile, storeSrc, imageKey);

		storeFile &&
			(await fetch(`${window.ENV.WORKER_URL}/upload-file/${imageKey}`, {
				body: storeFile,
				method: "POST",
				headers: {
					"Content-Type": storeFile.type,
					Authorization: `Bearer ${token}`,
				},
			}));
		store &&
			storeSrc &&
			(await dashboardRep?.mutate.uploadStoreImage({
				id: store.id,
				type: "storeImage",
				image: {
					id: imageKey,
					url: `${window.ENV.WORKER_URL}/images/${imageKey}`,
					order: 0,
					name: "store image",
				},
			}));
	}, [dashboardRep, store, storeFile, storeSrc, getToken]);

	const saveCroppedImage = useCallback(async () => {
		const image = imgRef.current;
		const previewCanvas = previewCanvasRef.current;
		if (!image || !previewCanvas || !completedCrop) {
			throw new Error("Crop canvas does not exist");
		}

		// This will size relative to the uploaded image
		// size. If you want to size according to what they
		// are looking at on screen, remove scaleX + scaleY
		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;

		const offscreen = new OffscreenCanvas(
			completedCrop.width * scaleX,
			completedCrop.height * scaleY,
		);
		const ctx = offscreen.getContext("2d");
		if (!ctx) {
			throw new Error("No 2d context");
		}

		ctx.drawImage(
			previewCanvas,
			0,
			0,
			previewCanvas.width,
			previewCanvas.height,
			0,
			0,
			offscreen.width,
			offscreen.height,
		);
		// You might want { type: "image/jpeg", quality: <0 to 1> } to
		// reduce image size
		const blob = await offscreen.convertToBlob({
			type: "image/png",
		});
		const token = await getToken();

		const croppedFile = new File([blob], "crop.png", {
			type: "image/png",
		});
		const imageKey = generateID({ prefix: "img" });
		const croppedImageKey = generateID({ prefix: "img" });
		headerFile &&
			(await Promise.all([
				fetch(`${window.ENV.WORKER_URL}/upload-file/${imageKey}`, {
					body: headerFile,
					method: "POST",
					headers: {
						"Content-Type": headerFile.type,
						Authorization: `Bearer ${token}`,
					},
				}),
				fetch(`${window.ENV.WORKER_URL}/upload-file/${croppedImageKey}`, {
					body: croppedFile,
					method: "POST",
					headers: {
						"Content-Type": croppedFile.type,
						Authorization: `Bearer ${token}`,
					},
				}),
			]));

		store &&
			(await dashboardRep?.mutate.uploadStoreImage({
				id: store.id,
				type: "headerImage",
				image: {
					id: imageKey,

					url: `${window.ENV.WORKER_URL}/images/${imageKey}`,

					croppedUrl: `${window.ENV.WORKER_URL}/images/${croppedImageKey}`,
					order: 0,
					name: "crop.png",
				},
			}));
	}, [completedCrop, store, getToken, dashboardRep, headerFile]);
	async function onSubmit(data: UpdateStore["updates"]) {
		await saveStoreInfo(data);
	}
	const showCanvas =
		!!completedCrop?.width &&
		!!completedCrop?.height &&
		!!imgRef.current &&
		!!previewCanvasRef.current;
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<Button variant="ghost" className="mt-2" onClick={() => setIsOpen(true)}>
				Edit store
			</Button>
			<DialogContent className="md:w-[600px] bg-mauve-2 p-0 gap-0">
				<span className="flex w-full justify-center p-4 border-mauve-6">
					<div>
						{isCropOpen && (
							<Button
								className="absolute top-3 left-3"
								variant="ghost"
								onClick={() => setIsCropOpen(false)}
							>
								Back
								<Icons.left size={20} />
							</Button>
						)}
						{!isCropOpen && headerSrc && (
							<Button
								className="absolute top-3 left-3 text-mauve-11"
								variant="ghost"
								onClick={() => setIsCropOpen(true)}
							>
								View image
								<Icons.right size={20} />
							</Button>
						)}
					</div>
					<DialogTitle className="text-2xl">Edit store</DialogTitle>
					<Button
						type="button"
						variant={"ghost"}
						size="icon"
						className="text-mauve-11 absolute top-3 right-3"
						onClick={() => setIsOpen(false)}
					>
						<Icons.close />
					</Button>
				</span>
				<div className="w-full relative">
					<CropImage
						src={headerSrc}
						setCompletedCrop={setCompletedCrop}
						imgRef={imgRef}
						isCropOpen={isCropOpen}
						crop={crop}
						setCrop={setCrop}
					/>
					<div
						className={cn("relative w-full h-[14rem]", {
							hidden: isCropOpen,
						})}
					>
						<input
							type="file"
							accept="image/*"
							ref={storeInputRef}
							className="hidden"
							onChange={onStoreImageChange}
						/>
						<Avatar
							className="border-mauve-6 z-20 absolute  left-4 bottom-0 border aspect-square w-full h-full max-w-32 max-h-32 min-w-32 min-h-32 cursor-pointer"
							onClick={storeInputClick}
							onKeyDown={storeInputClick}
						>
							<AvatarImage src={storeSrc ?? undefined} />
							<AvatarFallback className="hover:bg-mauve-4">
								{store?.name.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="w-full h-[10rem] bg-mauve-5 relative border-y border-mauve-6 flex justify-center items-center">
							<canvas
								ref={previewCanvasRef}
								style={{
									objectFit: "fill",
									width: "100%",
									height: "100%",
									maxHeight: "10rem",
									position: "absolute",
									visibility: isCropOpen ? "hidden" : "visible",
								}}
							/>
							{!showCanvas && store?.headerImage?.croppedUrl && (
								<Image
									src={store.headerImage.croppedUrl}
									fit="fill"
									alt="header"
									className="absolute"
								/>
							)}
							<input
								type="file"
								accept="image/*"
								ref={headerInputRef}
								className="hidden"
								onChange={onHeaderImageChange}
							/>
							<Avatar
								className="h-16 w-16 cursor-pointer border-none bg-mauve-a-3 hover:bg-mauve-a-6"
								onClick={headerInputClick}
								onKeyDown={headerInputClick}
							>
								<ImagePlaceholder />
							</Avatar>
							{headerSrc && (
								<Button
									className="rounded-full absolute top-2 right-2 bg-mauve-a-3 hover:bg-mauve-a-6 border-none"
									size={"icon"}
									variant={"ghost"}
									onClick={deleteStoreImage}
								>
									<Icons.close className="text-mauve-11" />
								</Button>
							)}
						</div>
					</div>
				</div>
				{!isCropOpen && (
					<form
						className="p-4 flex flex-col gap-2"
						// onSubmit={methods.handleSubmit(onSubmit)}
					>
						<span>
							<Label className="text-mauve-11">Name</Label>
							<Input
								// {...methods.register("name")}
								className="w-full md:w-40"
								defaultValue={store?.name}
								// state={methods.formState.errors.name ? "error" : "neutral"}
								// stateText={methods.formState.errors.name?.message}
							/>
						</span>
						<span>
							<Label className="text-mauve-11">Description</Label>
							<Textarea
								// {...methods.register("description")}
								defaultValue={store?.description ?? ""}
							/>
						</span>

						<div className="flex justify-center">
							<Button disabled={isLoading} type="submit">
								{isLoading && <LoadingSpinner />}
								Save
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
