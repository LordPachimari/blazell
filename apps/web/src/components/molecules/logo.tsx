import { Link } from "@remix-run/react";

type LogoProps = Omit<React.ComponentProps<typeof Link>, "href">;

function Logo({ className = "", ...props }: LogoProps) {
	return (
		<Link
			className={`${className} block text-center  text-2xl font-extrabold transition-all`}
			unstable_viewTransition
			{...props}
			to="/"
		>
			<span className="text-balance bg-black bg-gradient-to-b from-crimson-9 to-crimson-11 bg-clip-text text-2xl font-bold text-transparent lg:tracking-tight">
				Pachi
			</span>
		</Link>
	);
}

export { Logo };
