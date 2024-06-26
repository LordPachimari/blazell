import type React from "react";
import { useRef, useEffect } from "react";
import { motion, useAnimation, inView } from "framer-motion";

interface FadeUpProps {
	children: React.ReactNode;
	delay?: number;
	duration?: number;
	distance?: number;
}

const FadeUp: React.FC<FadeUpProps> = ({
	children,
	delay = 0,
	duration = 0.5,
	distance = 50,
}) => {
	const ref = useRef(null);
	const controls = useAnimation();

	useEffect(() => {
		const element = ref.current;
		if (element) {
			const cleanup = inView(element, (isInView) => {
				if (isInView) {
					controls.start({ opacity: 1, y: 0 });
				}
			});
			return cleanup;
		}
	}, [controls]);

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: distance }}
			animate={controls}
			transition={{ duration, delay, ease: "easeOut" }}
			className="w-full"
		>
			{children}
		</motion.div>
	);
};

export default FadeUp;
