function ParallaxContainer({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`${className} sm:h-[100vh] h-[80vh] flex justify-center transition-all  `}
		>
			<div className="fixed inset-0 md:inset-auto md:min-w-[40rem]">
				{children}
			</div>
		</div>
	);
}

export { ParallaxContainer };
