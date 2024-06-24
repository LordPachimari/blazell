import * as React from "react";
import {
	EyeClosedIcon,
	EyeOpenIcon,
	MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from ".";

const inputBaseStyles = cn(
	"bg-component hover:bg-mauve-a-1 shadow-sm border-mauve-5 dark:border-mauve-7   shadow-buttons-neutral placeholder-mauve-9 text-ui-fg-base transition-fg relative w-full appearance-none rounded-xl border outline-none",
	"focus:border-crimson-8 focus:shadow-crimson-5 focus:shadow-sm",
	"disabled:text-mauve-6 disabled:!bg-mauve-4 disabled:placeholder-mauve-6 disabled:cursor-not-allowed disabled:!shadow-none",
	"aria-[invalid=true]:!border-ui-border-error aria-[invalid=true]:focus:!shadow-crimson-10 invalid:!border-crimson-10 invalid:focus:!shadow-crimson-10",
);

export const inputVariants = cva(
	cn(
		inputBaseStyles,
		"[&::--webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
	),
	{
		variants: {
			size: {
				base: "txt-compact-medium h-10 px-3 py-[9px]",
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
		}
>(({ className, type, stateText, size = "base", ...props }, ref) => {
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
						"pr-11": isPassword && size === "base",
						"pl-11": isSearch && size === "base",
						"pr-9": isPassword && size === "small",
						"pl-9": isSearch && size === "small",
					},
					className,
				)}
				{...props}
			/>
			<ErrorText state={props.state} stateText={stateText} />
			{isSearch && (
				<div
					className={cn(
						"absolute bottom-0 left-0 flex items-center justify-center text-ui-fg-muted",
						{
							"h-10 w-11": size === "base",
							"h-8 w-9": size === "small",
						},
					)}
					role="img"
				>
					<MagnifyingGlassIcon />
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
