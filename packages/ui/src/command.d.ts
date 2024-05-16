import * as React from "react";
import type { DialogProps } from "@radix-ui/react-dialog";
import { type DialogPosition } from "./dialog";
declare const Command: React.ForwardRefExoticComponent<
	Omit<
		{
			children?: React.ReactNode;
		} & Pick<
			Pick<
				React.DetailedHTMLProps<
					React.HTMLAttributes<HTMLDivElement>,
					HTMLDivElement
				>,
				"key" | keyof React.HTMLAttributes<HTMLDivElement>
			> & {
				ref?: React.Ref<HTMLDivElement> | undefined;
			} & {
				asChild?: boolean | undefined;
			},
			"key" | keyof React.HTMLAttributes<HTMLDivElement> | "asChild"
		> & {
				label?: string | undefined;
				shouldFilter?: boolean | undefined;
				filter?:
					| ((
							value: string,
							search: string,
							keywords?: string[] | undefined,
					  ) => number)
					| undefined;
				defaultValue?: string | undefined;
				value?: string | undefined;
				onValueChange?: ((value: string) => void) | undefined;
				loop?: boolean | undefined;
				disablePointerSelection?: boolean | undefined;
				vimBindings?: boolean | undefined;
			} & React.RefAttributes<HTMLDivElement>,
		"ref"
	> &
		React.RefAttributes<HTMLDivElement>
>;
interface CommandDialogProps extends DialogProps, DialogPosition {}
declare const CommandDialog: ({
	children,
	position,
	...props
}: CommandDialogProps) => React.JSX.Element;
declare const CommandInput: React.ForwardRefExoticComponent<
	Omit<
		Omit<
			Pick<
				Pick<
					React.DetailedHTMLProps<
						React.InputHTMLAttributes<HTMLInputElement>,
						HTMLInputElement
					>,
					"key" | keyof React.InputHTMLAttributes<HTMLInputElement>
				> & {
					ref?: React.Ref<HTMLInputElement> | undefined;
				} & {
					asChild?: boolean | undefined;
				},
				"key" | "asChild" | keyof React.InputHTMLAttributes<HTMLInputElement>
			>,
			"onChange" | "type" | "value"
		> & {
			value?: string | undefined;
			onValueChange?: ((search: string) => void) | undefined;
		} & React.RefAttributes<HTMLInputElement>,
		"ref"
	> &
		React.RefAttributes<HTMLInputElement>
>;
declare const CommandList: React.ForwardRefExoticComponent<
	Omit<
		{
			children?: React.ReactNode;
		} & Pick<
			Pick<
				React.DetailedHTMLProps<
					React.HTMLAttributes<HTMLDivElement>,
					HTMLDivElement
				>,
				"key" | keyof React.HTMLAttributes<HTMLDivElement>
			> & {
				ref?: React.Ref<HTMLDivElement> | undefined;
			} & {
				asChild?: boolean | undefined;
			},
			"key" | keyof React.HTMLAttributes<HTMLDivElement> | "asChild"
		> & {
				label?: string | undefined;
			} & React.RefAttributes<HTMLDivElement>,
		"ref"
	> &
		React.RefAttributes<HTMLDivElement>
>;
declare const CommandEmpty: React.ForwardRefExoticComponent<
	Omit<
		{
			children?: React.ReactNode;
		} & Pick<
			Pick<
				React.DetailedHTMLProps<
					React.HTMLAttributes<HTMLDivElement>,
					HTMLDivElement
				>,
				"key" | keyof React.HTMLAttributes<HTMLDivElement>
			> & {
				ref?: React.Ref<HTMLDivElement> | undefined;
			} & {
				asChild?: boolean | undefined;
			},
			"key" | keyof React.HTMLAttributes<HTMLDivElement> | "asChild"
		> &
			React.RefAttributes<HTMLDivElement>,
		"ref"
	> &
		React.RefAttributes<HTMLDivElement>
>;
declare const CommandGroup: React.ForwardRefExoticComponent<
	Omit<
		{
			children?: React.ReactNode;
		} & Omit<
			Pick<
				Pick<
					React.DetailedHTMLProps<
						React.HTMLAttributes<HTMLDivElement>,
						HTMLDivElement
					>,
					"key" | keyof React.HTMLAttributes<HTMLDivElement>
				> & {
					ref?: React.Ref<HTMLDivElement> | undefined;
				} & {
					asChild?: boolean | undefined;
				},
				"key" | keyof React.HTMLAttributes<HTMLDivElement> | "asChild"
			>,
			"value" | "heading"
		> & {
				heading?: React.ReactNode;
				value?: string | undefined;
				forceMount?: boolean | undefined;
			} & React.RefAttributes<HTMLDivElement>,
		"ref"
	> &
		React.RefAttributes<HTMLDivElement>
>;
declare const CommandSeparator: React.ForwardRefExoticComponent<
	Omit<
		Pick<
			Pick<
				React.DetailedHTMLProps<
					React.HTMLAttributes<HTMLDivElement>,
					HTMLDivElement
				>,
				"key" | keyof React.HTMLAttributes<HTMLDivElement>
			> & {
				ref?: React.Ref<HTMLDivElement> | undefined;
			} & {
				asChild?: boolean | undefined;
			},
			"key" | keyof React.HTMLAttributes<HTMLDivElement> | "asChild"
		> & {
			alwaysRender?: boolean | undefined;
		} & React.RefAttributes<HTMLDivElement>,
		"ref"
	> &
		React.RefAttributes<HTMLDivElement>
>;
declare const CommandItem: React.ForwardRefExoticComponent<
	Omit<
		{
			children?: React.ReactNode;
		} & Omit<
			Pick<
				Pick<
					React.DetailedHTMLProps<
						React.HTMLAttributes<HTMLDivElement>,
						HTMLDivElement
					>,
					"key" | keyof React.HTMLAttributes<HTMLDivElement>
				> & {
					ref?: React.Ref<HTMLDivElement> | undefined;
				} & {
					asChild?: boolean | undefined;
				},
				"key" | keyof React.HTMLAttributes<HTMLDivElement> | "asChild"
			>,
			"onSelect" | "disabled" | "value"
		> & {
				disabled?: boolean | undefined;
				onSelect?: ((value: string) => void) | undefined;
				value?: string | undefined;
				keywords?: string[] | undefined;
				forceMount?: boolean | undefined;
			} & React.RefAttributes<HTMLDivElement>,
		"ref"
	> &
		React.RefAttributes<HTMLDivElement>
>;
declare const CommandShortcut: {
	({
		className,
		...props
	}: React.HTMLAttributes<HTMLSpanElement>): React.JSX.Element;
	displayName: string;
};
export {
	Command,
	CommandDialog,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
	CommandSeparator,
};
//# sourceMappingURL=command.d.ts.map
