export interface SquareCounts {
	[size: number]: number;
}

type Grid = (
	| {
			id: string;
			size: number;
	  }
	| undefined
)[][];
export function generateGrid(
	rows: number,
	cols: number,
	_squareSizes: SquareCounts,
	highScoreEntities: { id: string }[],
	midScoreEntities: { id: string }[],
	lowScoreEntities: { id: string }[],
): Array<Grid> {
	const squareSizes = structuredClone(_squareSizes);
	const resultGrid: Array<Grid> = [];
	let n =
		highScoreEntities.length +
		midScoreEntities.length +
		lowScoreEntities.length;

	while (n !== 0) {
		console.log("n", n);
		const grid: Grid = Array(rows)
			.fill(undefined)
			.map(() => Array(cols).fill(undefined));

		// Place the high score product (size 4)
		let highScorePlaced = false;
		const highScoreEntity = highScoreEntities.pop();

		if (highScoreEntity) {
			placeSquare(grid, 0, 0, 4, highScoreEntity.id);
			squareSizes[4]--;
			highScorePlaced = true;
			n--;
		}

		// Fill the remaining cells, with low-mid score products
		for (let row = 0; row < rows; row++) {
			for (let col = highScorePlaced ? 4 : 0; col < cols; col++) {
				if (grid[row]?.[col] === undefined) {
					const maxSize = getMaxSquareSize(grid, row, col, squareSizes);
					const availableSizes = getAvailableSizes(maxSize, squareSizes);
					//pick random between size 1 and size 2
					const size =
						availableSizes[Math.floor(Math.random() * availableSizes.length)]!;

					if (
						(size === 2 && midScoreEntities.length > 0) ||
						(lowScoreEntities.length === 0 &&
							midScoreEntities.length > 0 &&
							canPlaceSquare(grid, row, col, 2))
					) {
						const midScoreProduct = midScoreEntities.pop();
						placeSquare(grid, row, col, 2, midScoreProduct!.id);
						squareSizes[2]--;
						n--;
						continue;
					}
					if (
						(size === 1 && lowScoreEntities.length > 0) ||
						(size === 2 &&
							midScoreEntities.length === 0 &&
							lowScoreEntities.length > 0)
					) {
						const lowScoreProduct = lowScoreEntities.pop();
						placeSquare(grid, row, col, 1, lowScoreProduct!.id);
						squareSizes[1]--;
						n--;
						continue;
					}
					// edge case where there is no low-mid score products, we paste high score product if it fits
					if (
						lowScoreEntities.length === 0 &&
						midScoreEntities.length === 0 &&
						highScoreEntities.length > 0 &&
						canPlaceSquare(grid, row, col, 4)
					) {
						const highScoreProduct = highScoreEntities.pop();
						placeSquare(grid, row, col, 4, highScoreProduct!.id);
						squareSizes[4]--;
						n--;
					}
				}
			}
		}

		resultGrid.push(grid);
	}
	return resultGrid;
}

function canPlaceSquare(
	grid: Grid,
	row: number,
	col: number,
	size: number,
): boolean {
	if (row + size > grid.length || col + size > grid[0]!.length) {
		return false;
	}
	for (let i = row; i < row + size; i++) {
		for (let j = col; j < col + size; j++) {
			if (grid[i]?.[j] !== undefined) {
				return false;
			}
		}
	}
	return true;
}

function placeSquare(
	grid: Grid,
	row: number,
	col: number,
	size: number,
	id: string,
): void {
	for (let i = row; i < row + size; i++) {
		for (let j = col; j < col + size; j++) {
			grid[i]![j] = { id, size };
		}
	}
}

function getMaxSquareSize(
	grid: Grid,
	row: number,
	col: number,
	squareSizes: SquareCounts,
): number {
	const maxSize = Math.min(grid.length - row, grid[0]!.length - col);
	for (let size = maxSize; size >= 1; size--) {
		if (squareSizes[size]! > 0 && canPlaceSquare(grid, row, col, size)) {
			return size;
		}
	}
	return 0;
}

function getAvailableSizes(
	maxSize: number,
	squareSizes: SquareCounts,
): number[] {
	const availableSizes: number[] = [];
	for (let size = maxSize; size >= 1; size--) {
		if (squareSizes[size]! > 0) {
			availableSizes.push(size);
		}
	}
	return availableSizes;
}

function generateRandomPosition(rows: number, cols: number): [number, number] {
	const row = Math.floor(Math.random() * (rows - 3));
	const col = Math.floor(Math.random() * (cols - 3));
	return [row, col];
}

// Example usage
const rows = 4;
const cols = 12;
const squareSizes: SquareCounts = {
	4: 1,
	2: 4,
	1: 16,
};
