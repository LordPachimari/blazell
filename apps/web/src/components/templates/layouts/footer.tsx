import { Link } from "@remix-run/react";

const { COMPANY_NAME, SITE_NAME } = process.env;

export default function Footer() {
	const currentYear = new Date().getFullYear();
	const copyrightDate = currentYear;
	const copyrightName = COMPANY_NAME ?? SITE_NAME ?? "";

	return (
		<footer className="text-sm absolute h-[200px] bottom-0 z-40 w-full bg-component">
			<div className="mx-auto flex w-full flex-col gap-6 border-t border-neutral-200 px-6 py-12 text-sm dark:border-neutral-700 md:flex-row md:gap-12 md:px-4 xl:px-0">
				<div>
					<Link
						className="flex items-center gap-2 text-black dark:text-white md:pt-1"
						to="/"
						unstable_viewTransition
					>
						{/* <LogoSquare size="sm" /> */}
						<span className="uppercase">{SITE_NAME}</span>
					</Link>
				</div>
			</div>
			<div className="py-6 text-sm">
				<div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-1 px-4 md:flex-row md:gap-0 md:px-4 xl:px-0">
					<p>
						&copy; {copyrightDate} {copyrightName}
						{copyrightName.length && !copyrightName.endsWith(".") ? "." : ""}{" "}
						Pachi
					</p>
					<hr className="mx-4 hidden h-4 w-[1px] md:inline-block" />
					<p className="md:ml-auto">
						Crafted by{" "}
						<a href="https://vercel.com" className="text-black dark:text-white">
							▲ Vercel
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
