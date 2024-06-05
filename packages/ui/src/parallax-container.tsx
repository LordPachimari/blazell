function ParallaxContainer({
	children,
	className = "h-screen",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={className}>
			<div className="fixed inset-0">{children}</div>
		</div>
	);
}

export { ParallaxContainer };
