import { Link } from "@remix-run/react";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="text-sm border-t border-mauve-7 h-[50px] bottom-0 w-full bg-component">
			<div className="p-6 text-sm">
				<div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-1 px-4 md:flex-row md:gap-0 md:px-4 xl:px-0">
					<Link to="/" className="flex gap-2 items-center">
						<h1 className="text-xl text-mauve-11 font-freeman">Blazell</h1>

						<p className="text-mauve-11">© {currentYear}</p>
					</Link>
					<hr className="mx-4 hidden h-4 w-[1px] md:inline-block" />
					<p className="md:ml-auto">
						Crafted by{" "}
						<a
							href="https://vercel.com"
							className="text-black font-semibold dark:text-white"
						>
							LordPachi
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
