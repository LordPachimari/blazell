import { json, type LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async () => {
	return json({});
};
export default function Appearance() {
	return (
		<div className="h-screen pt-16 lg:p-20 p-2 flex flex-col">
			<div className="p-4 h-20 border-b border-border w-full">
				<h1 className="text-4xl font-freeman">Appearance</h1>
			</div>
			<section className="w-full flex border-t border-border">
				<div className="w-1/4 sm:w-full p-4 ">
					<h2 className="font-bold text-slate-11 text-xl">Theme</h2>
					<p className="text-slate-11 text-sm">Customize your UI theme.</p>
				</div>
				<div className="w-3/4 grid grid-cols-3 gap-2 lg:w-full p-4 sm:min-w-[350px]">
					<div className="min-h-28 w-full bg-component rounded-lg" />
					<div className="min-h-28 w-full bg-component rounded-lg" />
					<div className="min-h-28 w-full bg-component rounded-lg" />
				</div>
			</section>
			<section className="w-full flex border-t border-border">
				<div className="w-1/4 sm:w-full p-4 ">
					<h2 className="font-bold text-slate-11 text-xl">Accent color</h2>
					<p className="text-slate-11 text-sm">Choose your accent color.</p>
				</div>
				<div className="w-3/4 grid grid-cols-3 gap-2 lg:w-full p-4 sm:min-w-[350px]">
					<div className="min-h-28 w-full bg-component rounded-lg" />
					<div className="min-h-28 w-full bg-component rounded-lg" />
					<div className="min-h-28 w-full bg-component rounded-lg" />
				</div>
			</section>
		</div>
	);
}
