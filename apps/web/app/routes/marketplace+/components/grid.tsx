import type { PublishedProduct } from "@blazell/validators/client";

interface GridComponentProps {
	data: PublishedProduct[];
	columns?: number;
	rows?: number;
}
const generateGrid = ({ data, columns = 5, rows = 10 }: GridComponentProps) => {
	const grids = [];
	let index = 0;

	while (index < data.length) {
		// Create a new 5x10 grid
		const grid = Array.from({ length: columns }, () =>
			Array<PublishedProduct | undefined>(rows).fill(undefined),
		);
		const map = new Map<number, number>();

		while (index < data.length) {
			const columnIndex = index % columns;
			const rowIndex = map.get(columnIndex) ?? 0;

			if (rowIndex >= rows) break; // Break if the row is full

			grid[columnIndex]![rowIndex] = data[index];
			map.set(columnIndex, rowIndex + 1);
			index++;
		}
		grids.push(grid);
	}

	return grids;
};

export { generateGrid };
