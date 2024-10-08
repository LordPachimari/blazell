import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./";

const toggleVariants = cva(
	"inline-flex items-center overflow-hidden border border-border   bg-component justify-center text-slate-11 rounded-md font-medium ring-offset-background transition-colors hover:bg-slate-2 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring   disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-brand-2 data-[state=on]:border-brand-9 data-[state=on]:dark:border-brand-9 data-[state=on]:text-brand-9",
	{
		variants: {
			variant: {
				default: "bg-component",
				outline:
					"border border-slate-6 bg-component hover:border-brand-9 hover:bg-brand-2 hover:text-brand-9",
			},
			size: {
				default: "h-10 px-3",
				sm: "h-9 px-2.5",
				lg: "h-11 px-5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const Toggle = React.forwardRef<
	React.ElementRef<typeof TogglePrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
		VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
	<TogglePrimitive.Root
		ref={ref}
		className={cn(toggleVariants({ variant, size, className }))}
		{...props}
	/>
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
