import { Card, CardContent, CardHeader, CardTitle } from "@pachi/ui/card";

import { Button } from "@pachi/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@pachi/ui/dropdown-menu";

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

type Category = {
	name: string;
	id: string;
	children: Category[];
};

export function CategoryDropdown() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="w-full">
				<Button variant="outline" type="button">
					Select category
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<span>Invite users</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						{/* <DropdownMenuSubContent></DropdownMenuSubContent> */}
					</DropdownMenuPortal>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
