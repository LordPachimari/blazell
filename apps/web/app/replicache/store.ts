import { useEffect, useState } from "react";
import type { Replicache } from "replicache";
import { useSubscribe } from "replicache-react";

export const ReplicacheStore = {
	getByPK: <Item>(rep: Replicache | null, key: string) =>
		createGetByPK<Item>(rep, key),
	getByID: <Item>(rep: Replicache | null, id: string) =>
		createGetByID<Item>(rep, id),
	scan: <Item>(rep: Replicache | null, prefix: string) =>
		createScan<Item>(rep, prefix),
};

function createGetByPK<T>(rep: Replicache | null, key: string): T | null {
	const item = useSubscribe(
		rep,
		async (tx) => {
			const item = await tx.get(key);
			return item as T;
		},
		{ default: null, dependencies: [key] },
	);

	return item;
}

function createGetByID<T>(rep: Replicache | null, id: string): T | null {
	const item = useSubscribe(
		rep,
		async (tx) => {
			const [item] = await tx
				.scan({
					indexName: "id",
					start: {
						key: [id],
					},

					limit: 1,
				})
				.values()
				.toArray();

			return item as T;
		},

		{ default: null, dependencies: [id] },
	);

	return item;
}

function createScan<T>(rep: Replicache | null, prefix: string): T[] {
	const [data, setData] = useState<T[]>([]);

	useEffect(() => {
		rep?.experimentalWatch(
			(diffs) => {
				for (const diff of diffs) {
					if (diff.op === "add") {
						setData((prev) => [
							...(prev || []),
							structuredClone(diff.newValue) as T,
						]);
					}

					if (diff.op === "change") {
						setData((prev) => [
							...(prev
								? prev.filter(
										(item) =>
											(item as { replicachePK: string }).replicachePK !==
											diff.key,
									)
								: []),
							structuredClone(diff.newValue) as T,
						]);
					}

					if (diff.op === "del") {
						setData((prev) =>
							prev
								? prev.filter(
										(item) =>
											(item as { replicachePK: string }).replicachePK !==
											diff.key,
									)
								: [],
						);
					}
				}
			},
			{ prefix, initialValuesInFirstDiff: true },
		);
	}, [rep, prefix]);
	return data;
}
