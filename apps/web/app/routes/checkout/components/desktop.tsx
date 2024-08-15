import { Button } from "@blazell/ui/button";
import { toast } from "@blazell/ui/toast";
import { CheckoutFormSchema } from "@blazell/validators";
import { FormProvider, getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { useCartState } from "~/zustand/state";
import { useGlobalStore } from "~/zustand/store";
import { CartInfo } from "./cart-info";
import { CustomerInfo } from "./customer-info";
import { ShippingAddressInfo } from "./shipping-address-info";

export const DesktopCheckout = ({ cartID }: { cartID: string }) => {
	const fetcher = useFetcher();
	const users = useGlobalStore((state) => state.users);
	const cartMap = useGlobalStore((state) => state.cartMap);
	const cart = cartMap.get(cartID);

	const items = useGlobalStore((state) =>
		state.lineItems.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
	);

	const [user] = users;

	const { opened, setOpened } = useCartState();

	const [form, fields] = useForm({
		id: "checkout-form",
		constraint: getZodConstraint(CheckoutFormSchema),
		defaultValue: {
			fullName: cart?.fullName ?? "",
			email: user?.email ?? cart?.email ?? "",
			phone: cart?.phone ?? user?.phone,
			shippingAddress: cart?.shippingAddress,
		},
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: CheckoutFormSchema });
		},
		onSubmit() {
			if (items.length === 0) {
				toast.error("Cart is empty");
				return;
			}
		},
	});
	const isSubmitting = fetcher.state === "submitting";
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (opened) {
			setOpened(false);
		}
	}, [opened]);

	//TODO: CREATE ACTUAL WORKFLOW

	return (
		<main className="w-full p-4 mt-14 flex justify-center">
			<div className="max-w-[1300px] w-full mb-20 ">
				<FormProvider context={form.context}>
					<fetcher.Form
						method="POST"
						action="/action/complete-cart"
						{...getFormProps(form)}
					>
						<div className="w-full flex gap-10 flex-col md:flex-row">
							<div className="order-1 md:order-0 w-full md:w-7/12 gap-4 flex flex-col">
								<CustomerInfo
									user={user}
									fields={{
										email: fields.email.name,
										fullName: fields.fullName.name,
										phone: fields.phone.name,
									}}
								/>
								<ShippingAddressInfo
									fields={{ shippingAddress: fields.shippingAddress.name }}
								/>
								{/* <PaymentInfo /> */}
								<section className="mt-2 md:hidden">
									<Button
										className="w-full"
										type="submit"
										disabled={isSubmitting}
									>
										Pay
									</Button>
								</section>
							</div>

							<div className="order-0 md:order-1 w-full md:w-5/12">
								<CartInfo cart={cart} items={items} />

								<section className="mt-4 hidden md:flex">
									<Button
										className="w-full"
										type="submit"
										disabled={isSubmitting}
									>
										Pay
									</Button>
								</section>
							</div>
						</div>
					</fetcher.Form>
				</FormProvider>
			</div>
		</main>
	);
};
