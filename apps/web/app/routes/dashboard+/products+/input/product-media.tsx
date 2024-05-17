import { DndContext } from "@dnd-kit/core";
import type { Image } from "@pachi/validators";
import { useCallback } from "react";
import { LargeFirstTile } from "~/components/dnd-kit/Sortable/large-first-tile";
import { FileUpload } from "~/components/molecules/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@pachi/ui/card";
import { useReplicache } from "~/zustand/replicache";

export function Media({
	images,
	id,
}: Readonly<{
	images: Image[] | undefined;
	id: string | undefined;
}>) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const uploadImages = useCallback(
		async (images: Image[]) => {
			id &&
				(await dashboardRep?.mutate.uploadImages({
					images,
					id,
				}));
		},
		[dashboardRep, id],
	);
	const deleteImage = useCallback(
		async (imageID: string) => {
			id &&
				(await dashboardRep?.mutate.deleteImage({
					imageID,
					id,
				}));
		},
		[id, dashboardRep],
	);

	const updateImagesOrder = useCallback(
		async ({
			order,
		}: {
			order: Record<string, number>;
		}) => {
			if (id && dashboardRep)
				await dashboardRep.mutate.updateImagesOrder({
					order,
					id: id,
				});
		},
		[dashboardRep, id],
	);
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
					maxSize={8 * 1024 * 1024}
				/>
				<DndContext>
					{images && images.length > 0 && (
						<div className="py-2">
							<div className="gap-y-2x small flex flex-col">
								{images && (
									<LargeFirstTile
										items={images}
										updateImagesOrder={updateImagesOrder}
										isImage={true}
										onItemRemove={deleteImage}
									/>
								)}
							</div>
						</div>
					)}
				</DndContext>
			</CardContent>
		</Card>
	);
}
