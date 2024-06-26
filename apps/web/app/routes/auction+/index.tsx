import { Button } from "@blazell/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from "@blazell/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import { useNavigate } from "@remix-run/react";
import React from "react";
import { set } from "remeda";

export default function Auction() {
	return (
		<div className="w-screen flex justify-center mt-20">
			<AuctionOptions />
		</div>
	);
}

const AuctionOptions = () => {
	const [value, setValue] = React.useState<"offline" | "live">("offline");
	const navigate = useNavigate();
	return (
		<Dialog>
			<DialogTrigger>
				<Button>Start auction</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-10 pb-6">
				<DialogHeader className="flex text-center w-full flex-row justify-center font-bold text-xl">
					Auction type
				</DialogHeader>
				<ToggleGroup
					type="single"
					className="flex gap-4"
					onValueChange={(val) => {
						setValue(val as "offline" | "live");
					}}
				>
					<ToggleGroupItem
						value="offline"
						className="w-full h-40 flex gap-2 font-bold text-xl"
					>
						Offline
					</ToggleGroupItem>
					<ToggleGroupItem
						value="live"
						className="w-full h-40 flex gap-2 font-bold text-xl"
					>
						Live
					</ToggleGroupItem>
				</ToggleGroup>

				<DialogFooter>
					<Button
						className="h-10"
						onClick={() => {
							if (value === "live") return navigate("/dashboard/auction/live");
						}}
					>
						Next
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
