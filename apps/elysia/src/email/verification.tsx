import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Text,
	render,
} from "@react-email/components";
interface OTPEmailTemplateProps {
	verifyURL: string;
	otp: string;
}

const BlazellOTPEmail: React.FC<Readonly<OTPEmailTemplateProps>> = ({
	verifyURL,
	otp,
}: OTPEmailTemplateProps) => {
	return (
		<Html>
			<Head />
			<Preview>Your Blazell OTP</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={header}>Blazell beta</Heading>
					<Text style={paragraph}>Hi there,</Text>
					<Text style={paragraph}>
						Your One Time Password (OTP) to log in to Blazell is:
					</Text>
					<Text style={otpStyle}>{otp}</Text>
					<Text style={paragraph}>
						You can enter this code manually, or click{" "}
						<Link href={verifyURL} style={link}>
							here
						</Link>{" "}
						to log in. This code is valid for 60 minutes.
					</Text>
					<Text style={paragraph}>
						If you did not request this email, you can safely ignore it —
						nothing will happen if you take no action.
					</Text>
					<Text style={footer}>© Blazell</Text>
				</Container>
			</Body>
		</Html>
	);
};
// Styles
const main = {
	backgroundColor: "#ffffff",
	fontFamily: "Arial, sans-serif",
};

const container = {
	margin: "0 auto",
	padding: "20px 0 48px",
	maxWidth: "580px",
};

const header = {
	backgroundColor: "#FF007B",
	color: "#ffffff",
	fontSize: "24px",
	fontWeight: "bold",
	padding: "12px",
	marginBottom: "24px",
};

const paragraph = {
	fontSize: "16px",
	lineHeight: "26px",
};
const otpStyle = {
	fontSize: "48px",
	fontWeight: "bold",
	textAlign: "center" as const,
	margin: "32px 0",
};

const link = {
	color: "#0000FF",
	textDecoration: "underline",
};

const footer = {
	color: "#8898aa",
	fontSize: "12px",
	textAlign: "center" as const,
};
const getOtpHTML = ({ otp, verifyURL }: { otp: string; verifyURL: string }) => {
	const html = render(<BlazellOTPEmail otp={otp} verifyURL={verifyURL} />, {
		pretty: true,
	});
	return html;
};

export { BlazellOTPEmail, getOtpHTML };
