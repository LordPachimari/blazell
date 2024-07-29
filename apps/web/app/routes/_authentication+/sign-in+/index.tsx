import { Button } from "@blazell/ui/button";
import { Input } from "@blazell/ui/input";
import { Label } from "@blazell/ui/label";
import { Link } from "@remix-run/react";

const SignIn = () => {
	return (
		<div className="flex items-center justify-center py-12">
			<div className="mx-auto grid w-[350px] gap-6">
				<div className="grid gap-2 text-center">
					<h1 className="text-3xl font-freeman">Login</h1>
				</div>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" placeholder="mail@example.com" />
					</div>
					<div className="grid gap-2">
						<div className="flex items-center">
							<Label htmlFor="password">Password</Label>
							<Link
								to="/forgot-password"
								className="ml-auto inline-block text-sm underline text-slate-11 focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none "
							>
								Forgot your password?
							</Link>
						</div>
						<Input id="password" type="password" />
					</div>
					<Button type="submit" className="w-full text-sm font-body">
						Login
					</Button>
					<Button
						variant="outline"
						className="w-full font-body text-slate-11 text-sm"
					>
						Google
					</Button>
				</div>
				<div className="mt-4 text-center text-sm text-slate-11">
					Don&apos;t have an account?{" "}
					<Link
						to="/sign-up"
						className="underline focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none "
					>
						Sign up
					</Link>
				</div>
			</div>
		</div>
	);
};
export default SignIn;
