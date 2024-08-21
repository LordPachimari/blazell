import { Card, CardHeader } from "@blazell/ui/card";

export default function Premium() {
	return (
		<div className="h-screen items-center pt-16 lg:p-20 p-2 flex flex-col">
			<Card className="p-4 border-b md:w-[500px] border-border w-full">
				<CardHeader>
					<h1 className="text-4xl text-center font-freeman bg-gradient-to-b bg-clip-text text-transparent from-brand-9 to-brand-11">
						Premium
					</h1>
					<p className="text-sm text-slate-11 text-center py-2">
						Go beyond the limits and unlock dozens of features by subscribing to
						Premium
					</p>
				</CardHeader>
			</Card>
		</div>
	);
}
