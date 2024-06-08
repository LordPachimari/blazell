import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
	DndContext,
	DragOverlay,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	closestCenter,
	defaultDropAnimationSideEffects,
	useSensor,
	useSensors,
	type Active,
	type Announcements,
	type CollisionDetection,
	type DropAnimation,
	type KeyboardCoordinateGetter,
	type MeasuringConfiguration,
	type Modifiers,
	type PointerActivationConstraint,
	type ScreenReaderInstructions,
	type UniqueIdentifier,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
	sortableKeyboardCoordinates,
	useSortable,
	type AnimateLayoutChanges,
	type NewIndexGetter,
	type SortingStrategy,
} from "@dnd-kit/sortable";

import type { Image } from "@blazell/validators";
import { Item } from "../components/Item";
import { List } from "../components/List";
import { Wrapper } from "../components/Wrapper";
import { createRange } from "../utilities";

export type ItemProps = Image;
export interface Props {
	activationConstraint?: PointerActivationConstraint;
	animateLayoutChanges?: AnimateLayoutChanges;
	adjustScale?: boolean;
	collisionDetection?: CollisionDetection;
	coordinateGetter?: KeyboardCoordinateGetter;
	Container?: any; // To-do: Fix me
	dropAnimation?: DropAnimation | null;
	getNewIndex?: NewIndexGetter;
	handle?: boolean;
	itemCount?: number;
	items: ItemProps[];
	measuring?: MeasuringConfiguration;
	modifiers?: Modifiers;
	renderItem?: any;
	removable?: boolean;
	reorderItems?: typeof arrayMove;
	strategy?: SortingStrategy;
	style?: React.CSSProperties;
	useDragOverlay?: boolean;
	getItemStyles?(args: {
		id: UniqueIdentifier;
		index: number;
		isSorting: boolean;
		isDragOverlay: boolean;
		overIndex: number;
		isDragging: boolean;
	}): React.CSSProperties;
	wrapperStyle?(args: {
		active: Pick<Active, "id"> | null;
		index: number;
		isDragging: boolean;
		id: UniqueIdentifier;
	}): React.CSSProperties;
	isDisabled?(id: UniqueIdentifier): boolean;
	isImage?: boolean;
	updateImagesOrder?(props: { order: Record<string, number> }): Promise<void>;
	onItemRemove?(id: UniqueIdentifier, url: string): Promise<void>;
}

const dropAnimationConfig: DropAnimation = {
	sideEffects: defaultDropAnimationSideEffects({
		styles: {
			active: {
				opacity: "0.5",
			},
		},
	}),
};

const screenReaderInstructions: ScreenReaderInstructions = {
	draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

export function Sortable({
	activationConstraint,
	animateLayoutChanges,
	adjustScale = false,
	Container = List,
	collisionDetection = closestCenter,
	coordinateGetter = sortableKeyboardCoordinates,
	dropAnimation = dropAnimationConfig,
	getItemStyles = () => ({}),
	getNewIndex,
	handle = false,
	itemCount = 16,
	items: initialItems,
	isDisabled = () => false,
	measuring,
	modifiers,
	removable,
	renderItem,
	reorderItems = arrayMove,
	strategy = rectSortingStrategy,
	style,
	useDragOverlay = true,
	wrapperStyle = () => ({}),
	isImage = true,
	updateImagesOrder,
	onItemRemove,
}: Props) {
	const [items, setItems] = useState<ItemProps[]>(
		() =>
			initialItems ??
			createRange<UniqueIdentifier>(itemCount, (index) => index + 1),
	);

	useEffect(() => {
		if (initialItems) setItems(initialItems);
	}, [initialItems]);
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const sensors = useSensors(
		useSensor(MouseSensor, {
			...(activationConstraint && {
				activationConstraint,
			}),
		}),
		useSensor(TouchSensor, {
			...(activationConstraint && {
				activationConstraint,
			}),
		}),
		useSensor(KeyboardSensor, {
			scrollBehavior: "auto",
			coordinateGetter,
		}),
	);
	const isFirstAnnouncement = useRef(true);
	const getIndex = (id: UniqueIdentifier) =>
		items.findIndex((item) => item.id === id);

	const getPosition = (id: UniqueIdentifier) =>
		items.findIndex((item) => item.id === id) + 1;
	const activeIndex = activeId ? getIndex(activeId) : -1;
	const handleRemove = removable
		? async (id: UniqueIdentifier, url: string) => {
				setItems((items) => items.filter((item) => item.id !== id));
				await onItemRemove?.(id, url);
			}
		: undefined;

	const announcements: Announcements = {
		onDragStart({ active: { id } }) {
			return `Picked up sortable item ${String(
				id,
			)}. Sortable item ${id} is in position ${getPosition(id)} of ${
				items.length
			}`;
		},
		onDragOver({ active, over }) {
			// In this specific use-case, the picked up item's `id` is always the same as the first `over` id.
			// The first `onDragOver` event therefore doesn't need to be announced, because it is called
			// immediately after the `onDragStart` announcement and is redundant.
			if (isFirstAnnouncement.current === true) {
				isFirstAnnouncement.current = false;
				return;
			}

			if (over) {
				return `Sortable item ${
					active.id
				} was moved into position ${getPosition(over.id)} of ${items.length}`;
			}

			return;
		},
		onDragEnd({ active, over }) {
			if (over) {
				return `Sortable item ${
					active.id
				} was dropped at position ${getPosition(over.id)} of ${items.length}`;
			}

			return;
		},
		onDragCancel({ active: { id } }) {
			return `Sorting was cancelled. Sortable item ${id} was dropped and returned to position ${getPosition(
				id,
			)} of ${items.length}.`;
		},
	};

	useEffect(() => {
		if (!activeId) {
			isFirstAnnouncement.current = true;
		}
	}, [activeId]);

	return (
		<DndContext
			accessibility={{
				announcements,
				screenReaderInstructions,
			}}
			sensors={sensors}
			collisionDetection={collisionDetection}
			onDragStart={({ active }) => {
				if (!active) {
					return;
				}

				setActiveId(active.id);
			}}
			onDragEnd={({ over }) => {
				setActiveId(null);

				if (over) {
					const overIndex = getIndex(over.id);

					if (activeIndex !== overIndex) {
						const reordered = reorderItems(items, activeIndex, overIndex);

						if (isImage && updateImagesOrder) {
							const order: Record<string, number> = {};

							reordered.forEach((item, index) => {
								order[item.id] = index;
							});
							setItems(reordered);
							updateImagesOrder({ order }).catch((err) => console.log(err));
						}
					}
				}
			}}
			onDragCancel={() => setActiveId(null)}
			{...(measuring && { measuring })}
			{...(modifiers && { modifiers })}
		>
			<Wrapper {...(style && { style })} center>
				<SortableContext items={items} strategy={strategy}>
					<Container>
						{items.map((item, index) => (
							<SortableItem
								key={item.id}
								id={item.id}
								handle={handle}
								item={item}
								index={index}
								style={getItemStyles}
								wrapperStyle={wrapperStyle}
								disabled={isDisabled(item.id)}
								renderItem={renderItem}
								isImage={isImage}
								{...(handleRemove && { onRemove: handleRemove })}
								{...(animateLayoutChanges && { animateLayoutChanges })}
								useDragOverlay={useDragOverlay}
								{...(getNewIndex && { getNewIndex })}
							/>
						))}
					</Container>
				</SortableContext>
			</Wrapper>
			{useDragOverlay
				? createPortal(
						<DragOverlay
							adjustScale={adjustScale}
							dropAnimation={dropAnimation}
						>
							{activeId ? (
								<Item
									item={items[activeIndex]!}
									handle={handle}
									renderItem={renderItem}
									wrapperStyle={wrapperStyle({
										active: { id: activeId },
										index: activeIndex,
										isDragging: true,
										id: items[activeIndex]!.id,
									})}
									style={getItemStyles({
										id: items[activeIndex]!.id,
										index: activeIndex,
										isSorting: activeId !== null,
										isDragging: true,
										overIndex: -1,
										isDragOverlay: true,
									})}
									dragOverlay
									isImage={isImage}
								/>
							) : null}
						</DragOverlay>,
						document.body,
					)
				: null}
		</DndContext>
	);
}

interface SortableItemProps {
	animateLayoutChanges?: AnimateLayoutChanges;
	disabled?: boolean;
	getNewIndex?: NewIndexGetter;
	id: string;
	index: number;
	handle: boolean;
	useDragOverlay?: boolean;
	onRemove?(id: UniqueIdentifier, url: string): Promise<void>;
	style(values: unknown): React.CSSProperties;
	renderItem?(args: unknown): React.ReactElement;
	wrapperStyle: Props["wrapperStyle"];
	item: ItemProps;
	isImage?: boolean;
}

export function SortableItem({
	disabled,
	animateLayoutChanges,
	getNewIndex,
	handle,
	id,
	index,
	onRemove,
	style,
	renderItem,
	useDragOverlay,
	wrapperStyle,
	item,
	isImage,
}: SortableItemProps) {
	const {
		active,
		attributes,
		isDragging,
		isSorting,
		listeners,
		overIndex,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
	} = useSortable({
		id,
		...(animateLayoutChanges && { animateLayoutChanges }),
		disabled: disabled ?? false,
		...(getNewIndex && { getNewIndex }),
	});

	return (
		<Item
			ref={setNodeRef}
			item={item}
			{...(disabled && { disabled })}
			dragging={isDragging}
			sorting={isSorting}
			handle={handle}
			handleProps={
				handle
					? {
							ref: setActivatorNodeRef,
						}
					: undefined
			}
			{...(renderItem && { renderItem })}
			index={index}
			style={style({
				index,
				id,
				isDragging,
				isSorting,
				overIndex,
			})}
			{...(onRemove && { onRemove: () => onRemove(id, item.url) })}
			transform={transform}
			transition={transition}
			{...(wrapperStyle && {
				wrapperStyle: wrapperStyle({ index, isDragging, active, id }),
			})}
			listeners={listeners}
			data-index={index}
			data-id={id}
			dragOverlay={!useDragOverlay && isDragging}
			{...attributes}
			{...(isImage && { isImage })}
		/>
	);
}
