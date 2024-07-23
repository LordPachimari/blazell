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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@blazell/ui/form";
import { Icons } from "@blazell/ui/icons";
import { Input } from "@blazell/ui/input";
import { ScrollArea } from "@blazell/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@blazell/ui/select";
import { toast } from "@blazell/ui/toast";
import {
	ISO_1666,
	VariantSchema,
	type UpdateVariant,
} from "@blazell/validators";
import type { Variant } from "@blazell/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";
const schema = VariantSchema.pick({
	weight: true,
	width: true,
	height: true,
	length: true,
	material: true,
	originCountry: true,
});

type ProductAttributes = z.infer<typeof schema>;
export function Attributes({
	variant,
	updateVariant,
}: {
	variant: Variant | undefined;
	updateVariant: (props: UpdateVariant) => Promise<void>;
}) {
	const [opened, setOpened] = React.useState(false);
	const countries = React.useMemo(() => Object.entries(ISO_1666), []);

	const methods = useForm<ProductAttributes>({
		resolver: zodResolver(schema),
		defaultValues: {
			height: variant?.height ?? null,
			width: variant?.width ?? null,
			length: variant?.length ?? null,
			weight: variant?.weight ?? null,
			material: variant?.material ?? null,
			originCountry: variant?.originCountry ?? null,
		},
	});
	const onSave = React.useCallback(
		async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
			e.preventDefault();
			const values = methods.getValues();
			if (!variant) return;
			if (
				(values.height && values.height !== variant.height) ||
				(values.length && values.length !== variant.length) ||
				(values.width && values.width !== variant.width) ||
				(values.material && values.material !== variant.material) ||
				(values.weight && values.weight !== variant.weight) ||
				(values.originCountry && values.originCountry !== variant.originCountry)
			) {
				await updateVariant({
					id: variant.id,
					updates: {
						...(values.height && {
							height: values.height,
						}),
						...(values.length && { length: values.length }),
						...(values.width && { width: values.width }),
						...(values.weight && { weight: values.weight }),
						...(values.material && { material: values.material }),
						...(values.originCountry && {
							originCountry: values.originCountry,
						}),
					},
				});
			}
			toast.success("Product updated.");
			setOpened(false);
		},
		[variant, updateVariant, methods.getValues],
	);
	return (
		<>
			<Card className="p-0 w-full">
				<CardHeader className="p-4 border-b flex justify-between rounded-t-lg items-center flex-row border-border">
					<CardTitle>Attributes</CardTitle>
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
						<p className="w-full text-sm text-slate-11">Height</p>

						<p className="w-full flex justify-center text-sm text-slate-11">
							{variant?.height ?? (
								<Icons.Minus className="size-4 text-slate-10" />
							)}
						</p>
					</div>
					<div className="flex py-4 border-b border-border p-4">
						<p className="w-full text-sm text-slate-11">Width</p>

						<p className="w-full flex justify-center text-sm text-slate-11">
							{variant?.width ?? (
								<Icons.Minus className="size-4 text-slate-10" />
							)}
						</p>
					</div>
					<div className="flex py-4 border-b border-border p-4">
						<p className="w-full text-sm text-slate-11">Length</p>

						<p className="w-full flex justify-center text-sm text-slate-11">
							{variant?.length ?? (
								<Icons.Minus className="size-4 text-slate-10" />
							)}
						</p>
					</div>
					<div className="flex py-4 border-b border-border p-4">
						<p className="w-full text-sm text-slate-11">Weight</p>

						<p className="w-full flex justify-center text-sm text-slate-11">
							{variant?.weight ?? (
								<Icons.Minus className="size-4 text-slate-10" />
							)}
						</p>
					</div>
					<div className="flex py-4 border-b border-border p-4">
						<p className="w-full text-sm text-slate-11">Material</p>

						<p className="w-full flex justify-center text-sm text-slate-11">
							{variant?.material ?? (
								<Icons.Minus className="size-4 text-slate-10" />
							)}
						</p>
					</div>
					<div className="flex py-4 p-4">
						<p className="w-full text-sm text-slate-11">Origin</p>

						<p className="w-full flex justify-center text-sm text-slate-11">
							{variant?.originCountry ? (
								//@ts-ignore
								ISO_1666[variant.originCountry]
							) : (
								<Icons.Minus className="size-4 text-slate-10" />
							)}
						</p>
					</div>
				</CardContent>
			</Card>
			<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
				<FormProvider {...methods}>
					<DialogContent className="sm:w-[500px]">
						<DialogTitle className="p-4 border-b border-border font-bold text-xl">
							Edit attributes
						</DialogTitle>
						<section className="p-4 flex flex-col gap-4">
							<FormField
								control={methods.control}
								name="height"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Height</FormLabel>
										<FormControl>
											<Input
												{...field}
												value={field.value ?? ""}
												type="number"
												onChange={(event) =>
													field.onChange(event.target.valueAsNumber)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={methods.control}
								name="width"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Width</FormLabel>
										<FormControl>
											<Input
												{...field}
												value={field.value ?? ""}
												type="number"
												onChange={(event) =>
													field.onChange(event.target.valueAsNumber)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={methods.control}
								name="length"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Length</FormLabel>
										<FormControl>
											<Input
												{...field}
												value={field.value ?? ""}
												type="number"
												onChange={(event) =>
													field.onChange(event.target.valueAsNumber)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={methods.control}
								name="weight"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Weight</FormLabel>
										<FormControl>
											<Input
												{...field}
												value={field.value ?? ""}
												type="number"
												onChange={(event) =>
													field.onChange(event.target.valueAsNumber)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={methods.control}
								name="material"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Material</FormLabel>
										<FormControl>
											<Input {...field} value={field.value ?? ""} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={methods.control}
								name="originCountry"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Origin</FormLabel>
										<FormControl>
											<Select
												{...field}
												value={field.value ?? ""}
												onValueChange={(value) => field.onChange(value)}
											>
												<SelectTrigger className="my-3">
													<SelectValue placeholder="Origin country" />
												</SelectTrigger>
												<SelectContent>
													<ScrollArea className="h-[300px]">
														{countries.map(([code, name]) => (
															<SelectItem key={code} value={code}>
																{name}
															</SelectItem>
														))}
													</ScrollArea>
												</SelectContent>
											</Select>
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
					</DialogContent>
				</FormProvider>
			</DialogRoot>
		</>
	);
}
