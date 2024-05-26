import React, { useEffect } from "react";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";

import { Handle, Remove } from "./components";

import styles from "./Item.module.css";
import { cn } from "@blazell/ui";
import type { ItemProps } from "../../Sortable/Sortable";
import { Loader2Icon } from "lucide-react";
import Image from "~/components/molecules/image";
import { toImageURL } from "~/utils/helpers";

export interface Props {
	dragOverlay?: boolean;
	color?: string;
	disabled?: boolean;
	dragging?: boolean;
	handle?: boolean;
	handleProps?: any;
	height?: number;
	index?: number;
	fadeIn?: boolean;
	transform?: Transform | null;
	listeners?: DraggableSyntheticListeners;
	sorting?: boolean;
	style?: React.CSSProperties;
	transition?: string | undefined;
	wrapperStyle?: React.CSSProperties;
	item: ItemProps;
	onRemove?(): Promise<void>;
	renderItem?(args: {
		dragOverlay: boolean;
		dragging: boolean;
		sorting: boolean;
		index: number | undefined;
		fadeIn: boolean;
		listeners: DraggableSyntheticListeners;
		ref: React.Ref<HTMLElement>;
		style: React.CSSProperties | undefined;
		transform: Props["transform"];
		transition: Props["transition"];
	}): React.ReactElement;
	isImage?: boolean;
}

export const Item = React.memo(
	React.forwardRef<HTMLLIElement, Props>(
		(
			{
				color,
				dragOverlay,
				dragging,
				disabled,
				fadeIn,
				handle,
				handleProps,
				height,
				index,
				listeners,
				onRemove,
				renderItem,
				sorting,
				style,
				transition,
				transform,
				item,
				wrapperStyle,
				isImage,
				...props
			},
			ref,
		) => {
			useEffect(() => {
				if (!dragOverlay) {
					return;
				}

				document.body.style.cursor = "grabbing";

				return () => {
					document.body.style.cursor = "";
				};
			}, [dragOverlay]);

			return renderItem ? (
				renderItem({
					dragOverlay: Boolean(dragOverlay),
					dragging: Boolean(dragging),
					sorting: Boolean(sorting),
					index,
					fadeIn: Boolean(fadeIn),
					listeners,
					ref,
					style,
					transform,
					transition,
				})
			) : (
				<li
					className={cn(
						styles.Wrapper,
						fadeIn && styles.fadeIn,
						sorting && styles.sorting,
						dragOverlay && styles.dragOverlay,
					)}
					style={
						{
							...wrapperStyle,
							transition: [transition, wrapperStyle?.transition]
								.filter(Boolean)
								.join(", "),
							"--translate-x": transform
								? `${Math.round(transform.x)}px`
								: undefined,
							"--translate-y": transform
								? `${Math.round(transform.y)}px`
								: undefined,
							"--scale-x": transform?.scaleX
								? `${transform.scaleX}`
								: undefined,
							"--scale-y": transform?.scaleY
								? `${transform.scaleY}`
								: undefined,
							"--index": index,
							"--color": color,
						} as React.CSSProperties
					}
					ref={ref}
				>
					<div
						className={cn(styles.Item, {
							relative: true,
						})}
					>
						{onRemove ? (
							<Remove
								className="absolute top-0 right-0 z-10"
								onClick={onRemove}
							/>
						) : null}
						<div
							className={cn(
								dragging && styles.dragging,
								handle && styles.withHandle,
								dragOverlay && styles.dragOverlay,
								disabled && styles.disabled,
								color && styles.color,
							)}
							style={style}
							// data-cypress="draggable-item"
							{...(!handle ? listeners : undefined)}
							{...props}
							tabIndex={!handle ? 0 : undefined}
						>
							{isImage ? (
								<div>
									{item?.base64 || item.url ? (
										<Image
											src={
												item.uploaded
													? item.url
													: toImageURL(item.base64, item.fileType)
											}
											alt={item.name ?? "Uploaded image"}
											fit="fill"
											width={228}
											height={228}
										/>
									) : null}
									{!item?.uploaded && (
										<div className="absolute inset-0 flex items-center justify-center rounded-md bg-black opacity-30 dark:bg-white">
											<Loader2Icon className="animate-spin text-white dark:text-black" />
										</div>
									)}
								</div>
							) : null}

							<span className={styles.Actions}>
								{handle ? <Handle {...handleProps} {...listeners} /> : null}
							</span>
						</div>
					</div>
				</li>
			);
		},
	),
);
