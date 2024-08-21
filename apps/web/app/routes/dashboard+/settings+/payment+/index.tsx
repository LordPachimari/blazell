import { Button } from "@blazell/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@blazell/ui/card";
import { LoadingSpinner } from "@blazell/ui/loading";
import { generateID } from "@blazell/utils";
import { useFetcher, useNavigate } from "@remix-run/react";
import React from "react";
import { useRequestInfo } from "~/hooks/use-request-info";
import { useReplicache } from "~/zustand/replicache";
import { useDashboardStore } from "~/zustand/store";

export default function Settings() {
	const { userContext } = useRequestInfo();
	const { authUser } = userContext;
	const rep = useReplicache((state) => state.dashboardRep);
	const paymentProfile = useDashboardStore((state) => state.paymentProfile);
	const navigate = useNavigate();
	const connectStripeAccount = React.useCallback(async () => {
		authUser &&
			(await rep?.mutate.createPaymentProfile({
				paymentProfile: {
					id: paymentProfile?.id ?? generateID({ prefix: "payment_profile" }),
					authID: authUser.id,
					createdAt: new Date().toISOString(),
					version: 0,
				},
				provider: "stripe",
			}));
	}, [rep, authUser, paymentProfile]);
	console.log("payment profile", paymentProfile);
	const fetcher = useFetcher();
	const isStripeLoading =
		paymentProfile?.stripe?.isLoading ?? fetcher.state === "submitting";
	return (
		<main className="p-2 sm:p-3 w-full flex justify-center pb-16 sm:pb-16 lg:pb-3">
			<div className="max-w-7xl w-full">
				<section>
					<div className="py-2 border-b border-border">
						<h1 className="font-bold text-lg">Payment options</h1>
					</div>
					<div className="py-4">
						<Card className="max-w-[300px] gap-4 flex flex-col">
							<CardHeader className="text-iris-9 font-bold text-lg">
								Stripe
							</CardHeader>
							<CardContent>
								<p className="text-sm text-slate-11">
									Connect your Stripe account to accept payments
								</p>
							</CardContent>
							<CardFooter>
								<Button
									onClick={() => {
										if (!paymentProfile?.stripe) {
											return connectStripeAccount();
										}
										if (paymentProfile?.stripe?.isOnboarded) {
											return navigate("/dashboard/settings/payment/stripe");
										}
										return fetcher.submit(
											{
												accountID: paymentProfile.stripe.id,
											},
											{
												method: "POST",
												action: "/action/stripe-link-account",
												preventScrollReset: true,
											},
										);
									}}
									disabled={!!paymentProfile?.stripe?.isLoading}
								>
									{isStripeLoading ? (
										<>
											<LoadingSpinner className="text-white size-4 mr-2" />
											{paymentProfile?.stripe?.isLoading
												? "Creating account"
												: "Integrating"}
										</>
									) : paymentProfile?.stripe?.isOnboarded ? (
										"Go to dashboard"
									) : paymentProfile?.stripe &&
										!paymentProfile.stripe?.isLoading ? (
										"Complete onboarding"
									) : (
										"Connect"
									)}
								</Button>
							</CardFooter>
						</Card>
					</div>
				</section>
			</div>
		</main>
	);
}
