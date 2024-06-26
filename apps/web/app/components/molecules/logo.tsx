import { Link } from "@remix-run/react";

type LogoProps = Omit<React.ComponentProps<typeof Link>, "href">;

function Logo({ className = "", ...props }: LogoProps) {
	return (
		<Link
			className={`${className} block text-center  text-2xl font-extrabold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1`}
			unstable_viewTransition
			{...props}
			to="/"
		>
			<span className="text-balance font-freeman  bg-black bg-gradient-to-b from-brand-9 to-brand-11 bg-clip-text text-4xl font-bold text-transparent lg:tracking-tight">
				Blazell
			</span>
		</Link>
	);
}

export { Logo };
