import { Button } from "~/components/ui/button";

export function UserNotCreated() {
	return (
		<section>
			<h1>User Not Created</h1>
			<p>
				It looks like you haven't created a user yet. Please create a user first
				or refresh the page.
			</p>
			<Button href="/create-user">Create user</Button>
		</section>
	);
}
