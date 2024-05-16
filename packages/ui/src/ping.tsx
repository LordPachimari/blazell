export const Ping = () => {
	return (
		<span className="relative justify-center items-center flex h-3 w-3">
			<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-9 opacity-75" />
			<span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-9" />
		</span>
	);
};
