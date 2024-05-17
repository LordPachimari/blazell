import { type LoaderFunction, redirect } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
	return redirect("/dashboard/store");
};
export default function Dashboard() {
	return <></>;
}
