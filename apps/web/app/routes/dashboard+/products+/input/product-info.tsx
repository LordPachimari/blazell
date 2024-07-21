import { cn } from "@blazell/ui";
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
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@blazell/ui/form";
import { Icons } from "@blazell/ui/icons";
import { Input } from "@blazell/ui/input";
import { Switch } from "@blazell/ui/switch";
import { Textarea } from "@blazell/ui/textarea";
import { toast } from "@blazell/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import {
	productStatuses,
	VariantSchema,
	type UpdateProduct,
	type UpdateVariant,
} from "@blazell/validators";
import type { Product, Variant } from "@blazell/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { ProductStatus } from "~/components/molecules/statuses/product-status";
const schema = VariantSchema.pick({
	title: true,
	description: true,
	handle: true,
}).and(
	z.object({
		status: z.enum(["draft", "published", "archived"]),
		discountable: z.boolean().optional(),
	}),
);

type ProductInfo = z.infer<typeof schema>;
export function ProductInfo({
	defaultVariant,
	product,
	updateVariant,
	updateProduct,
}: {
	defaultVariant: Variant | undefined;
	product: Product | undefined;
	updateVariant: (props: UpdateVariant) => Promise<void>;
	updateProduct: (updates: UpdateProduct["updates"]) => Promise<void>;
}) {
	const [opened, setOpened] = React.useState(false);

	const methods = useForm<ProductInfo>({
		resolver: zodResolver(schema),
		defaultValues: {
			description: defaultVariant?.description ?? "",
			discountable: product?.discountable ?? false,
			handle: defaultVariant?.handle ?? "",
			status: product?.status ?? "draft",
			title: defaultVariant?.title ?? "",
		},
	});

	console.log("errors", methods.formState.errors);
	const onSave = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			const values = methods.getValues();
			console.log("values", values);
			if (!defaultVariant) return;
			if (
				(values.status && values.status !== product?.status) ||
				(values.discountable !== undefined &&
					values.discountable !== product?.discountable)
			) {
				await updateProduct({
					...(values.status && { status: values.status }),
					...(values.discountable !== undefined && {
						discountable: values.discountable,
					}),
				});
			}
			if (
				(values.description &&
					values.description !== defaultVariant.description) ||
				(values.title && values.title !== defaultVariant.title) ||
				(values.handle && values.handle !== defaultVariant.handle)
			) {
				await updateVariant({
					id: defaultVariant.id,
					updates: {
						...(values.description && {
							description: values.description,
						}),
						...(values.title && { title: values.title }),
						...(values.handle && { handle: values.handle }),
					},
				});
			}
			toast.success("Product updated.");
			setOpened(false);
		},
		[
			defaultVariant,
			product?.status,
			product?.discountable,
			updateProduct,
			updateVariant,
			methods.getValues,
		],
	);
	console.log("product", defaultVariant?.handle);
	return (
		<>
			<Card className="p-0 w-full">
				<CardHeader className="p-4 border-b flex justify-between rounded-t-lg items-center flex-row border-border">
					<CardTitle>{defaultVariant?.title ?? "Untitled"}</CardTitle>
					<div className="flex gap-2 mt-0 no-space-y">
						<ProductStatus status={product?.status ?? "draft"} />
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
						<p className="w-full text-sm text-slate-11">Description</p>

						<p className="w-full flex justify-center text-sm text-slate-11">
							{defaultVariant?.description ?? (
								<Icons.Minus className="size-4 text-slate-10" />
							)}
						</p>
					</div>
					<div className="flex py-4 border-b border-border p-4">
						<p className="w-full text-sm text-slate-11">Handle</p>
						<p className="w-full flex justify-center text-sm text-slate-11">
							{"/"}
							{defaultVariant?.handle ?? (
								<Icons.Minus className="size-4 text-slate-10" />
							)}
						</p>
					</div>
					<div className="flex py-4 p-4">
						<p className="w-full text-sm text-slate-11">Discountable</p>

						<p className="w-full flex justify-center text-sm text-slate-11">
							{product?.discountable ? "true" : "false"}
						</p>
					</div>
				</CardContent>
			</Card>
			<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
				<DialogContent className="sm:w-[500px]">
					<FormProvider {...methods}>
						<DialogTitle className="p-4 border-b border-border font-bold text-xl">
							Edit product
						</DialogTitle>
						<section className="p-4 flex flex-col gap-4">
							<FormField
								control={methods.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<FormControl>
											<ToggleGroup
												type="single"
												value={field.value ?? "draft"}
												onValueChange={field.onChange}
											>
												{productStatuses.map((status) => (
													<ToggleGroupItem
														key={status}
														value={status}
														className="text-sm h-9"
													>
														{status}
													</ToggleGroupItem>
												))}
											</ToggleGroup>
										</FormControl>
										<FormDescription>Change product status.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={methods.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input {...field} value={field.value ?? ""} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={methods.control}
								name="handle"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Handle</FormLabel>
										<FormControl>
											<Input
												className="bg-slate-1 "
												icon={
													<div className="flex justify-center items-center text-slate-9">
														/
													</div>
												}
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={methods.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												className="bg-slate-1"
												{...field}
												value={field.value ?? ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={methods.control}
								name="discountable"
								render={({ field }) => (
									<FormItem className="flex gap-4 bg-slate-2 border border-border p-4 items-center justify-between rounded-lg">
										<FormControl>
											<>
												<div className="flex flex-col gap-2">
													<h2 className="font-bold text-sm">Discountable</h2>
													<p className="text-sm text-slate-11">
														When checked, discounts will be applied to this
														product.
													</p>
												</div>
												<Switch
													checked={field.value ?? false}
													onCheckedChange={field.onChange}
												/>
											</>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</section>

						<div className="p-4 flex justify-end w-full border-t border-border absolute bottom-0">
							<div className="flex gap-2">
								<Button variant={"outline"} onClick={() => setOpened(false)}>
									Cancel
								</Button>
								<Button onClick={onSave}>Save</Button>
							</div>
						</div>
					</FormProvider>
				</DialogContent>
			</DialogRoot>
		</>
	);
}
