import { cors } from "@elysiajs/cors";
import { Elysia, error } from "elysia";
import { z } from "zod";
import { getOtpHTML } from "./email/verification";
import { Resend } from "resend";

const VerifyOTPSchema = z.object({
	otp: z.string(),
	email: z.string(),
	emailVerifyURL: z.string(),
});

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
						credentials: true,
					}
				: {},
		),
	)
	.get("/", () => ({ message: "Hello, world!" }))
	.post("/emails/verify-otp", async ({ body }) => {
		const { email, otp, emailVerifyURL } = VerifyOTPSchema.parse(body);
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
	.listen(8080);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
