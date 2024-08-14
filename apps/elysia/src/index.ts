import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { cors } from "@elysiajs/cors";
import { Elysia, error } from "elysia";
import { z } from "zod";
import { getOtpHTML } from "./email/verification";

const VerifyOTPSchema = z.object({
	otp: z.string(),
	email: z.string(),
	emailVerifyURL: z.string(),
});

const app = new Elysia()
	.use(
		cors(
			// 	{
			// 	origin: [/^https:\/\/blazell\.com$/, /^https:\/\/blazell\.pages\.dev$/],
			// 	methods: ["POST", "OPTIONS", "GET", "PUT"],
			// 	credentials: true,
			// }
		),
	)
	.get("/", () => ({ message: "Hello, world!" }))
	.post("/emails/verify-otp", async ({ body }) => {
		console.log("body", body);
		const { email, otp, emailVerifyURL } = VerifyOTPSchema.parse(body);
		console.log("Sending email to", email, otp);
		const sesClient = new SESClient({
			region: "ap-southeast-2", // replace with your region
			credentials: {
				accessKeyId: process.env.AWS_EMAIL_ACCESS_KEY ?? "",
				secretAccessKey: process.env.AWS_EMAIL_SECRET_KEY ?? "",
			},
		});
		const params = {
			Destination: {
				ToAddresses: [email],
			},
			Message: {
				Body: {
					Html: {
						Charset: "UTF-8",
						Data: getOtpHTML({
							otp,
							verifyURL: emailVerifyURL.toString(),
						}),
					},
				},
				Subject: {
					Data: "Verify your email",
				},
			},
			Source: "opachimari@gmail.com",
		};
		try {
			const command = new SendEmailCommand(params);
			await sesClient.send(command);

			return { status: "success" };
		} catch (err) {
			console.error("Error sending email:", err);
			return error(500, "Error sending email");
		}
	})
	.listen(8080);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
