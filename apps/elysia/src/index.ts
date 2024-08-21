import { cors } from "@elysiajs/cors";
import { Elysia, error, t } from "elysia";
import { z } from "zod";
import { getOtpHTML } from "./email/verification";
import { Resend } from "resend";
import { Stripe } from "stripe";

const VerifyOTPSchema = z.object({
	otp: z.string(),
	email: z.string(),
	emailVerifyURL: z.string(),
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

const app = new Elysia()
	.use(
		cors(
			process.env.NODE_ENV === "production"
				? {
						origin: [
							/^https:\/\/blazell\.com$/,
							/^https:\/\/blazell\.pages\.dev$/,
						],
						methods: ["POST", "OPTIONS", "GET", "PUT"],
					}
				: {},
		),
	)
	.get("/", () => {
		return "Hello World";
	})
	.post("/emails/verify-otp", async ({ body }) => {
		const { email, otp, emailVerifyURL } = VerifyOTPSchema.parse(body);
		console.log("otp", otp);
		const resend = new Resend(process.env.RESEND_API_KEY);

		const data = await resend.emails.send({
			from: "blazell@blazell.com",
			to: [email],
			subject: "Verify Email",
			html: getOtpHTML({
				otp,
				verifyURL: emailVerifyURL.toString(),
			}),
		});
		if (data.error) {
			console.error(data.error);
			return error(500, "Failed to send email");
		}
	})
	.post(
		"/stripe/account-link",
		async ({ body }) => {
			try {
				const { accountID } = body as { accountID: string };

				const accountLink = await stripe.accountLinks.create({
					account: accountID,
					return_url: `${process.env.CLIENT_URL}/return/${accountID}`,
					refresh_url: `${process.env.CLIENT_URL}/refresh/${accountID}`,
					type: "account_onboarding",
				});

				return accountLink;
			} catch (err) {
				console.error(
					"An error occurred when calling the Stripe API to create an account link:",
					err,
				);
				error(500, "An error occurred when calling the Stripe API");
			}
		},
		{
			body: t.Object({
				accountID: t.String(),
			}),
		},
	)
	.post("/stripe/account", async () => {
		try {
			const account = await stripe.accounts.create({});

			return {
				accountID: account.id,
			};
		} catch (err) {
			console.error(
				"An error occurred when calling the Stripe API to create an account",
				err,
			);
			error(500, "An error occurred when calling the Stripe API");
		}
	})
	.get("/stripe/balance/:id", async ({ params }) => {
		if (!params.id) {
			error(400, "No account stripe account ID found.");
		}
		try {
			const balance = await stripe.balance.retrieve({
				stripeAccount: params.id,
			});

			return balance;
		} catch (err) {
			console.error(
				"An error occurred when calling the Stripe API to retrieve the balance:",
				err,
			);
			error(500, "An error occurred when calling the Stripe API");
		}
	})
	.get("/stripe/charges", async ({ body }) => {
		try {
			const { accountID } = body as { accountID: string };

			//@ts-ignore
			const charges = await stripe.charges.list({
				stripeAccount: accountID,
				limit: 100,
			});

			return charges;
		} catch (err) {
			console.error(
				"An error occurred when calling the Stripe API to retrieve charges:",
				err,
			);
			error(500, "An error occurred when calling the Stripe API");
		}
	})

	.listen(8080);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
