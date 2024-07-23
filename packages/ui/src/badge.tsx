import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./";

const badgeVariants = cva(
	"inline-flex items-center w-fit border m-0 h-8 rounded-md px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default: "bg-primary border-transparent text-primary-foreground",
				secondary:
					"bg-secondary hover:bg-secondary/80 border-transparent text-secondary-foreground",
				destructive:
					"bg-destructive hover:bg-destructive/80 border-transparent text-destructive-foreground",
				outline: "text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
