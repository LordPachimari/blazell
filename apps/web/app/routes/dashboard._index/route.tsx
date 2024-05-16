import { Link } from "@remix-run/react";

export default function Dashboard() {
	return (
		<main className="flex gap-3 bg-red-400 ">
			<Link to="/dashboard/store" prefetch="viewport">
				store
			</Link>
			<Link to="/dashboard/account" prefetch="viewport">
				account
			</Link>
			<Link to="/dashboard/products" prefetch="viewport">
				products
			</Link>
		</main>
	);
}
