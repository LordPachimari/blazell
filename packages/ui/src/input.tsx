import * as React from "react";
import {
	EyeClosedIcon,
	EyeOpenIcon,
	MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from ".";

const inputBaseStyles = cn(
	"bg-slate-1 hover:bg-slate-2 border-border border-b-slate-7 placeholder-slate-9 text-ui-fg-base shadow-sm transition-fg relative w-full appearance-none rounded-lg border outline-none",
	"focus-visible:border-brand-8 focus-visible:dark:border-brand-9 focus-visible:shadow-brand-5 focus-visible:shadow",
	"disabled:text-slate-8 disabled:!bg-slate-1 disabled:placeholder-slate-8 disabled:cursor-not-allowed disabled:!shadow-none",
	"aria-[invalid=true]:!border-ui-border-error aria-[invalid=true]:focus:!border-red-9 aria-[invalid=true]:focus:!border-2 aria-[invalid=true]:focus:!shadow-none invalid:!border-red-10",
);

export const inputVariants = cva(
	cn(
		inputBaseStyles,
		"[&::--webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
	),
	{
		variants: {
			size: {
				base: "txt-compact-medium text-sm h-10 px-3 py-[9px]",
				small: "txt-compact-small h-8 px-2 py-[5px]",
			},
			state: {
				error: "pachi-field-error",
				neutral: "pachi-field-neutral",
			},
		},
		defaultVariants: {
			size: "base",
		},
	},
);

const Input = React.forwardRef<
	HTMLInputElement,
	VariantProps<typeof inputVariants> &
		Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
			stateText?: string | undefined;
			icon?: React.ReactNode;
		}
>(({ className, type, stateText, size = "base", icon, ...props }, ref) => {
	const [typeState, setTypeState] = React.useState(type);

	const isPassword = type === "password";
	const isSearch = type === "search";

	return (
		<div className="relative w-full">
			<input
				ref={ref}
				type={isPassword ? typeState : type}
				className={cn(
					inputVariants({ size: size }),
					{
						"pr-12": (isPassword && size === "base") || !!icon,
						"pl-12": (isSearch && size === "base") || !!icon,
						"pr-11": isPassword && size === "small",
						"pl-11": isSearch && size === "small",
					},
					className,
				)}
				{...props}
			/>
			<ErrorText state={props.state} stateText={stateText} />
			{isSearch && (
				<div
					className={cn(
						"absolute bottom-0 left-0 flex items-center justify-center text-ui-fg-muted border-r",
						{
							"h-10 w-10": size === "base",
							"h-9 w-9": size === "small",
						},
					)}
					role="img"
				>
					<MagnifyingGlassIcon
						className={cn("text-slate-10 size-5", {
							"size-4": size === "small",
						})}
					/>
				</div>
			)}
			{icon && (
				<div
					className={cn(
						"absolute inset-0 flex items-center justify-center text-ui-fg-muted border-r ",
						{
							"h-10 w-10": size === "base",
							"h-8 w-8": size === "small",
						},
					)}
					role="img"
				>
					{icon}
				</div>
			)}
			{isPassword && (
				<div
					className={cn(
						"absolute bottom-0 right-0 flex w-11 items-center justify-center",
						{
							"h-10 w-11": size === "base",
							"h-8 w-9": size === "small",
						},
					)}
				>
					<button
						className="focus:shadow-borders-interactive-w-focus h-fit w-fit rounded-sm text-ui-fg-muted outline-none transition-all hover:text-ui-fg-base focus:text-ui-fg-base active:text-ui-fg-base"
						type="button"
						onClick={() => {
							setTypeState(typeState === "password" ? "text" : "password");
						}}
					>
						<span className="sr-only">
							{typeState === "password" ? "Show password" : "Hide password"}
						</span>
						{typeState === "password" ? <EyeOpenIcon /> : <EyeClosedIcon />}
					</button>
				</div>
			)}
		</div>
	);
});
Input.displayName = "Input";

export { Input, inputBaseStyles };
function ErrorText({
	state = "neutral",
	stateText,
}: {
	state?: "error" | "neutral" | undefined | null;
	stateText?: string | undefined;
}) {
	return state === "neutral" ? null : (
		<span className="block fixed text-start text-xs text-rose-500">
			{stateText}
		</span>
	);
}
