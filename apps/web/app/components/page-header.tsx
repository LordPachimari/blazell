const PageHeader = ({ title }: { title: string }) => {
	return (
		<section className="py-4 w-full">
			<h1 className="font-bold text-4xl">{title}</h1>
		</section>
	);
};
export { PageHeader };