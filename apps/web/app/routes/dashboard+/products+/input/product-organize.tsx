import { cn } from "@blazell/ui";
import { Badge } from "@blazell/ui/badge";
import { Button, buttonVariants } from "@blazell/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@blazell/ui/card";
import {
	DialogContent,
	DialogRoot,
	DialogTitle,
} from "@blazell/ui/dialog-vaul";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@blazell/ui/form";
import { Icons } from "@blazell/ui/icons";
import { Label } from "@blazell/ui/label";
import { TagInput } from "@blazell/ui/tag-input";
import type { Product } from "@blazell/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
const schema = z.object({
	tags: z.array(z.string()),
});

type ProductOrganize = z.infer<typeof schema>;
export function Organize({
	product,
}: {
	product: Product | undefined;
}) {
	const [opened, setOpened] = React.useState(false);

	const methods = useForm<ProductOrganize>({
		resolver: zodResolver(schema),
	});
	const onSubmit: SubmitHandler<ProductOrganize> = (data) => {
		console.log("data", data);
	};
	console.log("product", product);
	return (
		<Form {...methods}>
			<form
				className="w-full flex justify-center"
				onSubmit={methods.handleSubmit(onSubmit)}
			>
				<Card className="p-0 w-full">
					<CardHeader className="p-4 border-b flex justify-between rounded-t-lg items-center flex-row border-border">
						<CardTitle>Organize</CardTitle>
						<div className="flex gap-2 mt-0 no-space-y">
							<DropdownMenu>
								<DropdownMenuTrigger
									className={cn(
										buttonVariants({ size: "icon", variant: "ghost" }),
										"rounded-lg h-8 w-8 p-0 border-transparent hover:border-border hover:bg-slate-3",
									)}
								>
									<Icons.Dots className="h-4 w-4 text-slate-11" />
									<span className="sr-only">Open menu</span>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="center" className="w-[160px]">
									<DropdownMenuItem
										className="flex gap-2"
										onClick={() => setOpened(true)}
									>
										<Icons.Edit size={14} /> Edit
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</CardHeader>
					<CardContent className="rounded-lg w-full">
						<div className="flex py-4 border-b border-border p-4">
							<p className="w-full text-sm text-slate-11">Type</p>
							<p className="w-full flex justify-center text-sm text-slate-11">
								{product?.type ?? (
									<Icons.Minus className="size-4 text-slate-10" />
								)}
							</p>
						</div>
						<div className="flex py-4 border-b border-border p-4">
							<p className="w-full text-sm text-slate-11">Tags</p>
							<div className="flex w-full flex-wrap gap-1">
								{/* {(product.tags ?? []).map((value) => (
												<Badge
													key={value.id}
													className="h-6 bg-brand-3 border-brand-7 border text-brand-9 font-thin text-xs"
												>
													{value.value}
												</Badge>
											))} */}
							</div>
						</div>
					</CardContent>
				</Card>
				<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
					<DialogContent className="sm:w-[500px]">
						<DialogTitle className="p-4 border-b border-border font-bold text-xl">
							Edit attributes
						</DialogTitle>
						<section className="p-4 flex flex-col gap-4">
							<div className="flex flex-col gap-3">
								<Label>Type</Label>
								<Badge className="border-red-7 bg-red-4 text-red-9">
									Physical
								</Badge>
							</div>
							<FormField
								control={methods.control}
								name="tags"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tags</FormLabel>
										<FormControl>
											<TagInput
												placeholder="tags"
												value={field.value ?? []}
												onChange={field.onChange}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</section>

						<div className="p-4 flex justify-end w-full border-t border-border absolute bottom-0">
							{" "}
							<div className="flex gap-2">
								{" "}
								<Button variant={"outline"} onClick={() => setOpened(false)}>
									Cancel
								</Button>
								<Button>Save</Button>
							</div>
						</div>
					</DialogContent>
				</DialogRoot>
			</form>
		</Form>
	);
}
