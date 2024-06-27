import { cn } from "@blazell/ui";

export default function OrbitingCircles({
	className,
	children,
	reverse,
	duration = 20,
	delay = 10,
	radius = 50,
	path = true,
}: {
	className?: string;
	children?: React.ReactNode;
	reverse?: boolean;
	duration?: number;
	delay?: number;
	radius?: number;
	path?: boolean;
}) {
	return (
		<>
			{path && (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					version="1.1"
					className="pointer-events-none absolute inset-0 h-full w-full"
				>
					<circle
						className="stroke-black/10 stroke-1 dark:stroke-white/10"
						cx="50%"
						cy="50%"
						r={radius}
						fill="none"
						strokeDasharray={"4 4"}
					/>
				</svg>
			)}

			<div
				style={
					{
						"--duration": duration,
						"--radius": radius,
						"--delay": -delay,
					} as React.CSSProperties
				}
				className={cn(
					"absolute flex h-full w-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-black/10 [animation-delay:calc(var(--delay)*1000ms)] dark:bg-white/10",
					{ "[animation-direction:reverse]": reverse },
					className,
				)}
			>
				{children}
			</div>
		</>
	);
}

import { Icons } from "@blazell/ui/icons";

export function OrbitingShipping() {
	return (
		<div className="relative flex h-[500px] w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg">
			<span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
				Shipping
			</span>

			{/* Inner Circles */}
			<OrbitingCircles
				className="h-[30px] w-[30px] border-none bg-transparent"
				duration={20}
				delay={20}
				radius={80}
			>
				<Icons.UPC />
			</OrbitingCircles>
			<OrbitingCircles
				className="h-[30px] w-[30px] border-none bg-transparent"
				duration={20}
				delay={10}
				radius={80}
			>
				<Icons.UPC />
			</OrbitingCircles>

			{/* Outer Circles (reverse) */}
			<OrbitingCircles
				className="h-[50px] w-[50px] border-none bg-transparent"
				radius={190}
				duration={20}
				reverse
			>
				<Icons.FedEx />
			</OrbitingCircles>
			<OrbitingCircles
				className="h-[50px] w-[50px] border-none bg-transparent"
				radius={190}
				duration={20}
				delay={20}
				reverse
			>
				<Icons.FedEx />
			</OrbitingCircles>
		</div>
	);
}
export function OrbitingPayment() {
	return (
		<div className="relative flex h-[500px] w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg">
			<span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
				Payment
			</span>

			{/* Inner Circles */}
			<OrbitingCircles
				className="h-[30px] w-[30px] border-none bg-transparent"
				duration={20}
				delay={20}
				radius={80}
			>
				<Icons.Paypal />
			</OrbitingCircles>
			<OrbitingCircles
				className="h-[30px] w-[30px] border-none bg-transparent"
				duration={20}
				delay={10}
				radius={80}
			>
				<Icons.Visa />
			</OrbitingCircles>

			{/* Outer Circles (reverse) */}
			<OrbitingCircles
				className="h-[50px] w-[50px] border-none bg-transparent"
				radius={190}
				duration={20}
				reverse
			>
				<Icons.Mastercard />
			</OrbitingCircles>
			<OrbitingCircles
				className="h-[50px] w-[50px] border-none bg-transparent"
				radius={190}
				duration={20}
				delay={20}
				reverse
			>
				<Icons.Mastercard />
			</OrbitingCircles>
		</div>
	);
}
