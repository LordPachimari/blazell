import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./";

const buttonVariants = cva(
	"inline-flex items-center font-freeman focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring justify-center h-8 rounded-lg font-bold transition-colors disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"bg-gradient-to-b focus-visible:ring-offset-1 focus:ring-offset-brand-6 from-brand-9 from-50% to-brand-8 dark:to-brand-7 text-primary-foreground shadow hover:from-brand-10 hover:to-brand-8 border-brand-9 border text-white",
				destructive:
					"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
				outline:
					"border border-border border-b-slate-7  bg-component shadow-sm hover:bg-slate-2 hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
				ghost:
					"hover:bg-slate-2 backdrop-blur-sm border border-border  hover:text-mauve-2",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2 sm:px-3 md:text-md",
				sm: "h-6 rounded-lg px-3 text-xs",
				md: "h-9 rounded-lg px-3 text-sm",
				lg: "h-10  px-6 text-lg",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";

		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
