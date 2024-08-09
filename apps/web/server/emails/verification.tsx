import { renderAsync } from "@react-email/render";
interface OTPEmailTemplateProps {
	verifyURL: string;
	otp: string;
}

const BlazellOTPEmail: React.FC<Readonly<OTPEmailTemplateProps>> = ({
	verifyURL,
	otp,
}: OTPEmailTemplateProps) => {
	return (
		<div className="max-w-lg mx-auto p-6">
			<header className="bg-black text-white text-xl font-bold p-3 mb-6">
				Blazell beta
			</header>

			<main>
				<p className="mb-4">Hi there,</p>

				<p className="mb-4">
					Your One Time Password (OTP) to log in to Cara is:
				</p>

				<p className="text-4xl font-bold text-center my-8">{otp}</p>

				<p className="mb-4">
					You can enter this code manually, or click
					<a href={verifyURL} className="text-blue-600 underline">
						here
					</a>
					to log in. This code is valid for 60 minutes.
				</p>

				<p className="mb-8">
					If you did not request this email, you can safely ignore it — nothing
					will happen if you take no action.
				</p>

				{/* <div class="text-center mb-6">
					<a href="https://twitter.com" class="inline-block mr-4">
						<img src="https://react-email-demo-ijnnx5hul-resend.vercel.app/static/twitter.png" 
							 width="24" height="24" alt="Twitter" class="inline-block">
					</a>
					<a href="https://instagram.com" class="inline-block">
						<img src="https://react-email-demo-ijnnx5hul-resend.vercel.app/static/instagram.png" 
							 width="24" height="24" alt="Instagram" class="inline-block">
					</a>
				</div> */}
			</main>

			<footer className="text-center text-sm text-gray-500">
				© Blazell ·
				{/* <a href="#" class="text-blue-600 underline">
					Blog
				</a>{" "}
				·
				<a href="#" class="text-blue-600 underline">
					Support
				</a> */}
			</footer>
		</div>
	);
};
const getOtpHTML = ({ otp, verifyURL }: { otp: string; verifyURL: string }) => {
	const html = renderAsync(
		<BlazellOTPEmail otp={otp} verifyURL={verifyURL} />,
		{
			pretty: true,
		},
	);
	return html;
};

export { BlazellOTPEmail, getOtpHTML };
