import { Card, CardContent } from "@blazell/ui/card";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import React from "react";
import Image from "~/components/molecules/image";
import { LineItem } from "../line-item/line-item";
import type { Order } from "@blazell/validators/client";

export const OrderComponent = ({ order }: { order: Order }) => {
	const items = order.items;
	const [parent] = useAutoAnimate(/* optional config */);
	const [open, setOpen] = React.useState(false);
	return (
		<Card
			className="w-full cursor-pointer     border border-border   bg-component rounded-lg p-4"
			onClick={() => {
				if (items.length === 1) return;
				setOpen((prev) => !prev);
			}}
		>
			<CardContent className="border-none" ref={parent}>
				<section className="flex gap-4 w-full">
					<div className="flex flex-col gap-2">
						<Image
							src="https://github.com/shadcn.png"
							width={50}
							height={50}
							fit="contain"
							className="aspect-square min-w-20 h-20 rounded-lg"
						/>
						<h2 className="font-bold">{order.store?.name}</h2>
					</div>
					<div className="w-full flex flex-col gap-2">
						<h1 className="font-bold text-lg">Order #1</h1>
						<LineItem
							currencyCode={order.currencyCode}
							lineItem={items[0]!}
							readonly={true}
						/>
					</div>
				</section>
				{open && (
					<section className="flex gap-4 w-full">
						<div className="min-w-20" />
						<div className="w-full flex flex-col gap-2">
							{items.length > 1 &&
								items
									.slice(1)
									.map((item) => (
										<LineItem
											key={item.id}
											currencyCode={order.currencyCode}
											lineItem={item}
											readonly={true}
										/>
									))}
						</div>
					</section>
				)}

				<div className="w-4" />
			</CardContent>
		</Card>
	);
};
