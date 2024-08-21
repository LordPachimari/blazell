import { Card, CardContent, CardHeader } from "@blazell/ui/card";
import { useDashboardStore } from "~/zustand/store";

export default function Provider() {
	const paymentProfile = useDashboardStore((state) => state.paymentProfile);
	console.log("paymentProfile", paymentProfile);
	return (
		<div className="p-4">
			<div className="flex">
				<Card>
					<CardHeader>
						<h1 className="text-2xl font-bold">Balance</h1>
					</CardHeader>
					<CardContent>
						{paymentProfile?.stripe?.balance?.available.map((b) => (
							<p key={b.currency}>
								Available: {b.amount} {b.currency}
							</p>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
