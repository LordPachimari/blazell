import { Card, CardContent, CardHeader, CardTitle } from "@blazell/ui/card";

import { Button } from "@blazell/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";

export function ProductCategory() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Product Category</CardTitle>
			</CardHeader>
			<CardContent className="pt-4 ">
				<CategoryDropdown />
			</CardContent>
		</Card>
	);
}

export function CategoryDropdown() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="w-full">
				<Button variant="outline" className="rounded-lg" type="button">
					Select category
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<span>Under development</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						{/* <DropdownMenuSubContent></DropdownMenuSubContent> */}
					</DropdownMenuPortal>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
