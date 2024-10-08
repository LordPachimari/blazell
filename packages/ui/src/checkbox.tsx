import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "./";

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			"peer h-5 w-5 shrink-0 rounded-md border border-border  ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring   disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-brand-3 data-[state=checked]:text-brand-9 data-[state=checked]:border-brand-8 data-[state=checked]:dark:border-brand-8",
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			className={cn("flex items-center justify-center text-current")}
		>
			<Check className="h-5 w-5" />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
