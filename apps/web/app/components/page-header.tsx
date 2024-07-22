import { cn } from "@blazell/ui";

const PageHeader = ({
	title,
	className,
}: { title: string; className?: string }) => {
	return (
		<section className={cn("py-4 w-full flex", className)}>
			<h1 className="font-freeman text-2xl">{title}</h1>
		</section>
	);
};
export { PageHeader };
