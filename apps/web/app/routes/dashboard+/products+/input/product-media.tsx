import { closestCorners, DndContext } from "@dnd-kit/core";
import type { Image as ImageType } from "@blazell/validators";
import React, { useCallback } from "react";
import { FileUpload } from "~/components/molecules/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@blazell/ui/card";
import { useReplicache } from "~/zustand/replicache";
import { cn } from "@blazell/ui";
import { Sortable, SortableItem } from "@blazell/ui/sortable";
import { toImageURL } from "~/utils/helpers";
import Image from "~/components/molecules/image";
import { Checkbox } from "@blazell/ui/checkbox";
import { LoadingSpinner } from "@blazell/ui/loading";
import { Button } from "@blazell/ui/button";
import { Kbd } from "@blazell/ui/kbd";
import { useHotkeys } from "react-hotkeys-hook";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@blazell/ui/tooltip";
import { Icons } from "@blazell/ui/icons";

export function Media({
	images,
	variantID,
	className,
}: Readonly<{
	images: ImageType[] | undefined;
	variantID: string | undefined;
	className?: string;
}>) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const [imagesState, setImagesState] = React.useState(images ?? []);
	const [selectedImages, setSelectedImages] = React.useState<ImageType[]>([]);

	React.useEffect(() => {
		if (images) setImagesState(images);
	}, [images]);

	const uploadImages = useCallback(
		async (images: ImageType[]) => {
			variantID &&
				(await dashboardRep?.mutate.uploadImages({
					images,
					entityID: variantID,
				}));
		},
		[dashboardRep, variantID],
	);
	const deleteImage = useCallback(
		async (keys: string[], urls: string[]) => {
			variantID &&
				(await dashboardRep?.mutate.deleteImage({
					keys,
					entityID: variantID,
					urls,
				}));
		},
		[variantID, dashboardRep],
	);
	useHotkeys(["D"], async () => {
		await deleteImage(
			selectedImages.map((i) => i.id),
			selectedImages.map((i) => i.url),
		);
	});

	const updateImagesOrder = useCallback(
		async ({
			order,
		}: {
			order: Record<string, number>;
		}) => {
			if (variantID && dashboardRep)
				await dashboardRep.mutate.updateImagesOrder({
					order,
					entityID: variantID,
				});
		},
		[dashboardRep, variantID],
	);
	return (
		<>
			{selectedImages.length > 0 && (
				<FloatingBar
					deleteImage={deleteImage}
					selectedImages={selectedImages}
				/>
			)}
			<Card className={cn("overflow-hidden p-0", className)}>
				<CardHeader className="p-4 py-6 rounded-t-lg flex justify-center">
					<CardTitle>Media</CardTitle>
				</CardHeader>
				<CardContent>
					<FileUpload
						files={images}
						onFilesChange={uploadImages}
						maxFiles={8}
						maxSize={10 * 1024 * 1024}
					/>
					<DndContext>
						{images && images.length > 0 && (
							<div className="p-4 w-full relative">
								<div className="grid gap-4 grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5">
									{images.map((img) => (
										<div
											key={img.id}
											className={cn(
												"group bg-slate-2 border border-border shadow-inner rounded-lg aspect-square relative min-w-[120px] min-h-[120px]",
											)}
										/>
									))}
								</div>

								<Sortable
									orientation="mixed"
									collisionDetection={closestCorners}
									value={imagesState}
									onValueChange={(items) => {
										const order: Record<string, number> = {};

										items.forEach((item, index) => {
											order[item.id] = index;
										});
										setImagesState(items);
										updateImagesOrder({ order }).catch((err) =>
											console.log(err),
										);
									}}
								>
									<div className="grid gap-4 grid-cols-2 inset-4 absolute min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 ">
										{images.map((image, index) => {
											const selected = selectedImages.some(
												(i) => i.id === image.id,
											);
											return (
												<SortableItem
													value={image.id}
													asTrigger
													asChild
													key={image.id}
													disableDragOn=".checkbox-class"
													tabIndex={0}
													className="focus-visible:ring-1 focus-visible:ring-ring rounded-md"
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															if (selected) {
																setSelectedImages(
																	selectedImages.filter(
																		(i) => i.id !== image.id,
																	),
																);
															} else {
																setSelectedImages([...selectedImages, image]);
															}
														}
													}}
												>
													<div
														className={cn(
															"group relative min-w-[120px] min-h-[120px]",
															{ "border border-brand-9": selected },
														)}
													>
														{index === 0 && (
															<TooltipProvider>
																<Tooltip delayDuration={250}>
																	<TooltipTrigger asChild>
																		<div className="rounded-full bg-brand-9 size-5 flex justify-center items-center absolute left-2 top-2">
																			<Icons.Thumbnail
																				className="text-white"
																				size={11}
																			/>
																		</div>
																	</TooltipTrigger>
																	<TooltipContent className="flex items-center p-0 h-6 px-2 ">
																		<p className="text-xs font-thin">
																			Thumbnail
																		</p>
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
														)}
														{image?.uploaded ? (
															<Image
																src={image.url}
																alt={image.name ?? "Uploaded image"}
																fit="cover"
																width={120}
																height={120}
																className="border aspect-square border-border w-full h-full object-contain rounded-md"
															/>
														) : (
															<>
																<img
																	src={toImageURL(image.base64, image.fileType)}
																	alt={image.name ?? "Uploaded image"}
																	className="border brightness-75 w-full h-full aspect-square object-contain border-border   rounded-md"
																/>
																<div className="absolute inset-0 flex items-center justify-center">
																	<LoadingSpinner className="text-slate-2 size-10" />
																</div>
															</>
														)}
														<Checkbox
															checked={selectedImages.some(
																(i) => i.id === image.id,
															)}
															onCheckedChange={(value) => {
																if (value) {
																	setSelectedImages([...selectedImages, image]);
																} else {
																	setSelectedImages(
																		selectedImages.filter(
																			(i) => i.id !== image.id,
																		),
																	);
																}
															}}
															tabIndex={-1}
															className={cn(
																"hidden group-hover:block absolute right-2 top-2 checkbox-class bg-slate-2",
																{
																	block: selected,
																},
															)}
														/>
													</div>
												</SortableItem>
											);
										})}
									</div>
								</Sortable>
							</div>
						)}
					</DndContext>
				</CardContent>
			</Card>
		</>
	);
}

const FloatingBar = ({
	selectedImages,
	deleteImage,
}: {
	selectedImages: ImageType[];
	deleteImage: (keys: string[], urls: string[]) => Promise<void>;
}) => {
	return (
		<div className="fixed inset-x-0 bottom-16 lg:bottom-10 rounded-lg z-30 w-fit px-4 left-1/2 -translate-x-1/2">
			<TooltipProvider>
				<div className="w-full overflow-x-auto">
					<Card className="mx-auto flex w-fit items-center gap-2 p-2 shadow-2xl">
						<CardContent className="flex items-center gap-1.5">
							<Tooltip delayDuration={250}>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										className="flex gap-3"
										onClick={async (e) => {
											e.preventDefault();
											e.stopPropagation();
											await deleteImage(
												selectedImages.map((i) => i.id),
												selectedImages.map((i) => i.url),
											);
										}}
									>
										<Icons.Trash
											size={15}
											aria-hidden="true"
											className="text-red-9"
										/>
										<Kbd>D</Kbd>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Delete images</p>
								</TooltipContent>
							</Tooltip>
						</CardContent>
					</Card>
				</div>
			</TooltipProvider>
		</div>
	);
};
