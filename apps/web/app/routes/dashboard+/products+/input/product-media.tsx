import { DndContext } from "@dnd-kit/core";
import type { Image } from "@blazell/validators";
import { useCallback } from "react";
import { LargeFirstTile } from "~/components/dnd-kit/Sortable/large-first-tile";
import { FileUpload } from "~/components/molecules/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@blazell/ui/card";
import { useReplicache } from "~/zustand/replicache";

export function Media({
	images,
	variantID,
}: Readonly<{
	images: Image[] | undefined;
	variantID: string | undefined;
}>) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const uploadImages = useCallback(
		async (images: Image[]) => {
			variantID &&
				(await dashboardRep?.mutate.uploadImages({
					images,
					entityID: variantID,
				}));
		},
		[dashboardRep, variantID],
	);
	const deleteImage = useCallback(
		async (imageID: string) => {
			variantID &&
				(await dashboardRep?.mutate.deleteImage({
					imageID,
					entityID: variantID,
				}));
		},
		[variantID, dashboardRep],
	);

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
	console.log("images", images);
	return (
		<Card className="overflow-hidden my-4">
			<CardHeader className="pb-4">
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
						<div className="py-2">
							<div className="gap-y-2x small flex flex-col">
								<LargeFirstTile
									items={images}
									updateImagesOrder={updateImagesOrder}
									isImage={true}
									onItemRemove={deleteImage}
								/>
							</div>
						</div>
					)}
				</DndContext>
			</CardContent>
		</Card>
	);
}
