import "@bacons/text-decoder/install";
import { useColorScheme } from "nativewind";

import "../styles.css";

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
	const { colorScheme } = useColorScheme();
	return <></>;
}
