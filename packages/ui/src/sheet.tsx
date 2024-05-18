import * as Dialog from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { Icons } from "./icons";
import { cn } from "./";

function SheetContent({
	children,
	side = "right",
}: React.ComponentProps<typeof Dialog.Content> &
	VariantProps<typeof sheetContentVariants>) {
	return (
		<Dialog.Portal>
			<Dialog.Overlay
				className={cn(
					"fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
				)}
			/>
			<Dialog.Content className={cn(sheetContentVariants({ side }))}>
				{children}
				<Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-secondary">
					<Icons.close className="h-4 w-4" />
					<span className="sr-only">Close modal</span>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Portal>
	);
}

function SheetTitle(props: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<Dialog.Title
			className={cn(
				"space-y-2 text-center text-lg font-semibold text-foreground sm:text-left",
			)}
			{...props}
		/>
	);
}

const sheetContentVariants = cva(
	"fixed inset-y-0 z-50 m-2 flex w-5/6 flex-col gap-4 rounded-md bg-background p-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out dark:border dark:border-zinc-800 sm:max-w-sm",
	{
		variants: {
			side: {
				left: "left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
				right:
					"right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
			},
		},
		defaultVariants: {
			side: "right",
		},
	},
);

export { SheetContent, SheetTitle };
export {
	Root as SheetRoot,
	Trigger as SheetTrigger,
} from "@radix-ui/react-dialog";
