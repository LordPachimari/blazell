import { SignUp } from "@clerk/remix";

export default function RegisterPage() {
	return (
		<div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:px-0">
			<SignUp
				appearance={{
					elements: {
						formButtonPrimary:
							"inline-flex items-center font-freeman justify-center h-8 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-b from-crimson-9 from-50% to-crimson-8 dark:to-crimson-7 text-primary-foreground shadow hover:from-crimson-10 hover:to-crimson-8 border-crimson-9 border text-white",
					},
				}}
			/>
		</div>
	);
}
