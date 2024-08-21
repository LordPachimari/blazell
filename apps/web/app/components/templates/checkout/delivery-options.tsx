import { Icons } from "@blazell/ui/icons";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";

const DeliveryOptions = () => {
	return (
		<div className="w-full py-4 pb-10 ">
			<h2 className="flex min-w-[4rem] py-2 items-center font-semibold text-base">
				Delivery options
			</h2>
			<ToggleGroup
				className="flex flex-col gap-1"
				type="single"
				/* eslint-disable */ // field has onChange method so it shouldn't be passed to radio group
				onChange={() => {}}
				onClick={(e) => e.stopPropagation()}
			>
				{Array.from({ length: 3 }).map((_, index) => (
					<ToggleGroupItem
						key={index}
						value={index.toString()}
						className="group w-full"
					>
						<div className="flex w-full items-center justify-between">
							<p className="">Delivery option {index + 1}</p>
							<Icons.CircleCheck className="size-6 text-white fill-brand-9 opacity-0 transition group-data-[checked]:opacity-100" />
						</div>
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
};
export { DeliveryOptions };
