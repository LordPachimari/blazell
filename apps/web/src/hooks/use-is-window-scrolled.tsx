import { useState, useEffect } from "react";

function useIsWindowScrolled() {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 64); // The height of the header
		};

		window.addEventListener("scroll", handleScroll);

		// Call handleScroll to set the initial state based on the initial scroll position
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return isScrolled;
}

export { useIsWindowScrolled };
