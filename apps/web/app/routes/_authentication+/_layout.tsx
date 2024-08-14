import { Outlet } from "@remix-run/react";

function SignIn() {
	return (
		<div className="w-full h-screen p-3 lg:p-0 lg:grid lg:min-h-[600px] lg:grid-cols-2">
			<div className="hidden bg-muted lg:block">
				<img
					src="https://cdn.midjourney.com/845a8afa-1b61-478c-aff5-013bb5bb3d89/0_0.jpeg"
					alt="Onboarding"
					className="h-full max-h-screen w-full object-cover dark:brightness-[0.5] dark:grayscale"
				/>
			</div>
			<Outlet />
		</div>
	);
}
export default SignIn;
