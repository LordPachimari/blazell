import { Drawer } from "vaul";
import { cn } from ".";
import { Icons } from "./icons";
//@ts-ignore
const { Root, Trigger } = Drawer;
function DialogContent({
	children,
	className,
	overlay = true,
}: { children: React.ReactNode; className?: string; overlay?: boolean }) {
	return (
		<Drawer.Portal>
			{overlay && <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />}
			<Drawer.Content
				className={cn(
					"border-mauve-5 dark:border-mauve-7  fixed bottom-0 top-0 z-50 m-1 flex w-5/6 flex-col rounded-lg border bg-white dark:bg-mauve-3 backdrop-blur-md after:hidden sm:max-w-sm",
					className,
				)}
			>
				{children}
				<Drawer.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-component">
					<Icons.Close className="h-4 w-4" />
					<span className="sr-only">Закрыть модальное окно</span>
				</Drawer.Close>
			</Drawer.Content>
		</Drawer.Portal>
	);
}

function DialogTitle(props: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<Drawer.Title
			className={cn(
				"space-y-2 text-center text-lg font-semibold text-foreground sm:text-left",
			)}
			{...props}
		/>
	);
}

export {
	DialogContent,
	Root as DialogRoot,
	DialogTitle,
	Trigger as DialogTrigger,
};
