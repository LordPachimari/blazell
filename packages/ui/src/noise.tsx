export const Noise = () => {
	return (
		<div
			className="w-full h-full transform opacity-10"
			style={{
				backgroundImage: "url(/assets/noise.webp)",
				backgroundSize: "30%",
			}}
		/>
	);
};
export const Noise1 = () => {
	return (
		<div
			className="absolute inset-0 w-full h-full scale-[1.2] transform opacity-10 [mask-image:radial-gradient(#fff,transparent,75%)]"
			style={{
				backgroundImage: "url(/assets/noise.webp)",
				backgroundSize: "30%",
			}}
		/>
	);
};
