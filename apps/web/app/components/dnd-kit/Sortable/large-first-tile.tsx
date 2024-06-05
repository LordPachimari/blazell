import { rectSortingStrategy } from "@dnd-kit/sortable";

import { GridContainer } from "../components/GridContainer";
import { Sortable, type ItemProps, type Props } from "./Sortable";

const props: Partial<Props> = {
	adjustScale: true,
	Container: (props: any) => <GridContainer {...props} columns={6} />,
	strategy: rectSortingStrategy,
	wrapperStyle: () => ({
		width: 140,
		height: 140,
	}),
};
export const LargeFirstTile = ({
	items,
	updateImagesOrder,
	isImage,
	onItemRemove,
}: {
	items: ItemProps[];
	isImage?: boolean;
	updateImagesOrder?: (props: {
		order: Record<string, number>;
	}) => Promise<void>;
	onItemRemove?: (id: string) => Promise<void>;
}) => (
	<Sortable
		{...props}
		{...(isImage && { isImage })}
		{...(updateImagesOrder && { updateImagesOrder })}
		{...(onItemRemove && { onItemRemove })}
		items={items}
		removable
		getItemStyles={({ index }) => {
			if (index === 0) {
				return {
					fontSize: "2rem",
					padding: "10px 10px",
				};
			}

			return {};
		}}
		wrapperStyle={({ index }) => {
			if (index === 0) {
				return {
					height: 228,
					gridRowStart: "span 2",
					gridColumnStart: "span 2",
				};
			}

			return {
				width: 120,
				height: 120,
			};
		}}
	/>
);
