import { Button } from "@blazell/ui/button";
import { CheckoutFormSchema, type CheckoutForm } from "@blazell/validators";
import type { Cart, User } from "@blazell/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useCartState } from "~/zustand/state";
import { useGlobalStore } from "~/zustand/store";
import { CartInfo } from "./cart-info";
import { CustomerInfo } from "./customer-info";
import { ShippingAddressInfo } from "./shipping-address-info";
import { toast } from "@blazell/ui/toast";

export const DesktopCheckout = ({ cartID }: { cartID: string }) => {
	const users = useGlobalStore((state) => state.users);
	const cartMap = useGlobalStore((state) => state.cartMap);
	const cart = cartMap.get(cartID);

	const items = useGlobalStore((state) =>
		state.lineItems.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
	);

	const [user] = users;

	const { opened, setOpened } = useCartState();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const methods = useForm<CheckoutForm>({
		resolver: zodResolver(CheckoutFormSchema),
	});
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (opened) {
			setOpened(false);
		}
	}, [opened]);
	console.log("errors", methods.formState.errors);
	console.log("user", user);

	const prefill = (cart: Cart, user?: User) => {
		methods.setValue("fullName", cart.fullName ?? "");
		user
			? methods.setValue("email", user.email ?? "")
			: methods.setValue("email", cart.email ?? "");
		methods.setValue("phone", cart.phone ?? "");
		cart.shippingAddress &&
			methods.setValue(
				"shippingAddress",
				cart.shippingAddress as CheckoutForm["shippingAddress"],
			);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (cart) {
			prefill(cart, user);
		}
	}, [cart, user]);

	//TODO: CREATE ACTUAL WORKFLOW
	async function onSubmit(data: CheckoutForm) {
		if (items.length === 0) {
			toast.error("Cart is empty");
			return;
		}
		setIsLoading(true);

		const orderIDs = await fetch(
			`${window.ENV.WORKER_URL}/carts/complete-cart`,
			{
				headers: {
					"Content-Type": "application/json",
				},
				method: "POST",
				body: JSON.stringify({
					id: cartID,
					checkoutInfo: data,
				}),
			},
		).then((res) => res.json() as Promise<string[]>);
		if (orderIDs.length > 0) {
			navigate(
				`/order-confirmation?${orderIDs.map((id) => `id=${id}`).join("&")}`,
			);
		}

		setIsLoading(false);
	}

	return (
		<main className="w-full p-4 mt-14 flex justify-center">
			<div className="max-w-[1300px] w-full mb-20 ">
				<h1 className="w-full text-center font-bold text-4xl mb-6">Checkout</h1>

				<FormProvider {...methods}>
					<form
						className="w-full flex gap-10 flex-col md:flex-row"
						onSubmit={methods.handleSubmit(onSubmit)}
					>
						<div className="order-1 md:order-0 w-full md:w-7/12 gap-4 flex flex-col">
							<CustomerInfo user={user} />
							<ShippingAddressInfo />
							{/* <PaymentInfo /> */}
							<section className="mt-2 md:hidden">
								<Button className="w-full" type="submit" disabled={isLoading}>
									Pay
								</Button>
							</section>
						</div>

						<div className="order-0 md:order-1 w-full md:w-5/12">
							<CartInfo cart={cart} items={items} />

							<section className="mt-4 hidden md:flex">
								<Button className="w-full" type="submit" disabled={isLoading}>
									Pay
								</Button>
							</section>
						</div>
					</form>
				</FormProvider>
			</div>
		</main>
	);
};
