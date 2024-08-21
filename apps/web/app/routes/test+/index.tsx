import { type LoaderFunction, json } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async () => {
	return json({});
};
export default function Test() {
	return <div>Test</div>;
}
