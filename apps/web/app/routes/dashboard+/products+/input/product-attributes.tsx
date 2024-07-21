import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";
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
import { Input } from "@blazell/ui/input";
import { ScrollArea } from "@blazell/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@blazell/ui/select";
import { ISO_1666, VariantSchema } from "@blazell/validators";
import type { Variant } from "@blazell/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
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
}: {
	variant: Variant | undefined;
}) {
	console.log(variant);
	const [opened, setOpened] = React.useState(false);
	const countries = React.useMemo(() => Object.entries(ISO_1666), []);

	const methods = useForm<ProductAttributes>({
		resolver: zodResolver(schema),
	});
	const onSubmit: SubmitHandler<ProductAttributes> = (data) => {
		console.log("data", data);
	};
	return (
		<Form {...methods}>
			<form
				className="w-full flex justify-center"
				onSubmit={methods.handleSubmit(onSubmit)}
			>
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
							<p className="w-full text-sm text-slate-11">Description</p>
							<p className="w-full text-sm text-slate-11">Description</p>
						</div>
						<div className="flex py-4 border-b border-border p-4">
							<p className="w-full text-sm text-slate-11">Handle</p>
							<p className="w-full text-sm text-slate-11">Handle</p>
						</div>
						<div className="flex py-4 p-4">
							<p className="w-full text-sm text-slate-11">Discountable</p>
							<p className="w-full text-sm text-slate-11">Discountable</p>
						</div>
					</CardContent>
				</Card>
				<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
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
											<Input {...field} value={field.value ?? ""} />
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
											<Input {...field} value={field.value ?? ""} />
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
											<Input {...field} value={field.value ?? ""} />
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
											<Input {...field} value={field.value ?? ""} />
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
												value={field.value ?? "AU"}
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
					</DialogContent>
				</DialogRoot>
			</form>
		</Form>
	);
}
