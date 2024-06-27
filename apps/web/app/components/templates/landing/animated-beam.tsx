import type React from "react";
import { forwardRef, useRef } from "react";
import { AnimatedBeam } from "@blazell/ui/animated-beam";
import { cn } from "@blazell/ui";
import { Icons } from "@blazell/ui/icons";

const Circle = forwardRef<
	HTMLDivElement,
	{ className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
	return (
		<div
			ref={ref}
			className={cn(
				"z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white p-3",
				className,
			)}
		>
			{children}
		</div>
	);
});

export function AnimatedBeamDemo() {
	const containerRef = useRef<HTMLDivElement>(null);
	const div1Ref = useRef<HTMLDivElement>(null);
	const div2Ref = useRef<HTMLDivElement>(null);
	const div3Ref = useRef<HTMLDivElement>(null);
	const div4Ref = useRef<HTMLDivElement>(null);
	const div5Ref = useRef<HTMLDivElement>(null);
	const div6Ref = useRef<HTMLDivElement>(null);
	const div7Ref = useRef<HTMLDivElement>(null);

	return (
		<div
			className="relative flex w-full max-w-[500px] items-center justify-center overflow-hidden p-10"
			ref={containerRef}
		>
			<div className="flex h-full w-full flex-col items-stretch justify-between gap-10">
				<div className="flex flex-row items-center justify-between">
					<Circle ref={div1Ref}>
						<Icons.Pinterest />
					</Circle>
					<Circle ref={div5Ref}>
						<Icons.Facebook className="size-4 text-blue-500 dark:text-blue-600" />
					</Circle>
				</div>
				<div className="flex flex-row items-center justify-between">
					<Circle ref={div2Ref}>
						<Icons.Notion />
					</Circle>
					<div
						ref={div4Ref}
						className="p-2 text bg-component backdrop-blur-md  rounded-xl z-10 border border-border "
					>
						<span className="bg-gradient-to-b from-brand-9 to-brand-11 text-transparent font-black text-lg bg-clip-text">
							Blazell
						</span>
					</div>
					<Circle ref={div6Ref}>
						<Icons.Messenger />
					</Circle>
				</div>
				<div className="flex flex-row items-center justify-between">
					<Circle ref={div3Ref}>
						<Icons.Instagram className="text-pink-500" />
					</Circle>

					<Circle ref={div7Ref}>
						<Icons.Youtube className="fill-red-9 " />
					</Circle>
				</div>
			</div>

			<AnimatedBeam
				containerRef={containerRef}
				fromRef={div1Ref}
				toRef={div4Ref}
				curvature={-75}
				endYOffset={-10}
			/>
			<AnimatedBeam
				containerRef={containerRef}
				fromRef={div2Ref}
				toRef={div4Ref}
			/>
			<AnimatedBeam
				containerRef={containerRef}
				fromRef={div3Ref}
				toRef={div4Ref}
				curvature={75}
				endYOffset={10}
			/>
			<AnimatedBeam
				containerRef={containerRef}
				fromRef={div5Ref}
				toRef={div4Ref}
				curvature={-75}
				endYOffset={-10}
				reverse
			/>
			<AnimatedBeam
				containerRef={containerRef}
				fromRef={div6Ref}
				toRef={div4Ref}
				reverse
			/>
			<AnimatedBeam
				containerRef={containerRef}
				fromRef={div7Ref}
				toRef={div4Ref}
				curvature={75}
				endYOffset={10}
				reverse
			/>
		</div>
	);
}
