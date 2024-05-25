import { cn } from "@blazell/ui";
import type { Image as ImageType } from "@blazell/validators";
import { memo, useEffect, useMemo, useState } from "react";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { Card, CardContent, CardFooter } from "@blazell/ui/card";
import { useWindowSize } from "~/hooks/use-window-size";
import { generateGrid, type SquareCounts } from "~/utils/grid-generator";
import { Link } from "@remix-run/react";
import Image from "~/components/molecules/image";

function useResponsiveGrid() {
	const size = useWindowSize();
	const [gridState, setGridState] = useState({ cols: 12, rows: 4 });

	useEffect(() => {
		if (size.width && size.width < 640) {
			setGridState({ cols: 4, rows: 4 });
		} else if (size.width && size.width < 768) {
			setGridState({ cols: 6, rows: 4 });
		} else if (size.width && size.width < 1024) {
			setGridState({ cols: 8, rows: 4 });
		} else if (size.width && size.width < 1280) {
			setGridState({ cols: 10, rows: 4 });
		} else {
			setGridState({ cols: 12, rows: 4 });
		}
	}, [size.width]);

	return gridState;
}

type GridData = {
	id: string;
	score: number;
	title: string;
	description: string | null;
	thumbnail?: ImageType;
	handle: string;
};
interface GridComponentProps<TData> {
	data: (TData & GridData)[];
}
const GridComponentRaw = <_, T>({ data }: GridComponentProps<T>) => {
	const gridState = useResponsiveGrid();

	const idToEntity = new Map<string, T & GridData>();
	const highScoreEntities: { id: string }[] = [];
	const lowScoreEntities: { id: string }[] = [];
	const midScoreEntities: { id: string }[] = [];

	for (const entry of data) {
		if (entry.score <= 1) {
			lowScoreEntities.push(entry);
			idToEntity.set(entry.id, entry);
		} else if (entry.score > 1 && entry.score <= 3) {
			midScoreEntities.push(entry);
			idToEntity.set(entry.id, entry);
		} else {
			highScoreEntities.push(entry);
			idToEntity.set(entry.id, entry);
		}
	}

	const squareSizes: SquareCounts = useMemo(
		() => ({
			4: 1,
			2: 5,
			1: Number.POSITIVE_INFINITY,
		}),
		[],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const generatedGrid = useMemo(
		() =>
			generateGrid(
				gridState.rows,
				gridState.cols,
				squareSizes,
				highScoreEntities,
				midScoreEntities,
				lowScoreEntities,
			),
		[
			highScoreEntities,
			midScoreEntities,
			lowScoreEntities,
			gridState,
			squareSizes,
		],
	);
	return (
		<section className="flex p-4 gap-2 mt-10">
			{generatedGrid.map((grid) => {
				const idSet = new Set<string>();
				const flattedGrid: { id: string; size: number }[] = [];

				for (let i = 0; i < grid.length; i++) {
					for (let j = 0; j < grid[0]!.length; j++) {
						const value = grid[i]?.[j];
						if (value && !idSet.has(value.id)) {
							flattedGrid.push(value);
							idSet.add(value.id);
						}
					}
				}

				return (
					<div
						key={JSON.stringify(grid)}
						className="grid grid-cols-4 h-[500px] sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 min-w-[8rem] grid-rows-4 gap-2 shrink-0 w-[calc(100vw-35px)]"
					>
						{flattedGrid.map((gridValue) => {
							const entity = idToEntity.get(gridValue.id)!;
							return (
								<Card
									key={gridValue.id}
									className={cn("relative col-span-1 p-2 row-span-1", {
										"col-span-4 row-span-4": gridValue.size >= 4,
										"col-span-2 row-span-2": gridValue.size === 2,
									})}
								>
									<Link
										to={`/marketplace/products/${entity.handle}`}
										unstable_viewTransition
									>
										<CardContent
											className={cn(
												"relative min-w-[4rem] h-[calc(100%-4rem)] rounded-xl",
												{
													"h-[5rem]": gridValue.size < 2,
													"rounded-2x": gridValue.size >= 2,
												},
											)}
										>
											{entity.thumbnail ? (
												<Image
													src={entity.thumbnail.url}
													alt={entity.thumbnail.name}
													className={cn("rounded-lg border", {
														"rounded-2x": gridValue.size >= 2,
													})}
												/>
											) : (
												<ImagePlaceholder />
											)}
										</CardContent>
										<CardFooter className="h-24">
											{gridValue.size < 2 ? (
												<h2 className="text-xs font-bold truncate text-balance text-ellipsis overflow-hidden h-4">
													{entity.title}
												</h2>
											) : (
												<h2 className=" font-bold text-base truncate text-balance text-ellipsis overflow-hidden h-12">
													{entity.title}
												</h2>
											)}

											{gridValue.size > 1 && (
												<p className="text-sm truncate font-bold text-balance text-ellipsis overflow-hidden h-12">
													{entity.description}
												</p>
											)}
										</CardFooter>
									</Link>
								</Card>
							);
						})}
					</div>
				);
			})}
		</section>
	);
};
export default memo(GridComponentRaw);
