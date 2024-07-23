import {
	vitePlugin as remix,
	cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { flatRoutes } from "remix-flat-routes";
// import MillionLint from "@million/lint";
import { remixDevTools } from "remix-development-tools";
export default defineConfig({
	ssr: {
		noExternal: ["react-easy-crop", "tslib"],
	},
	optimizeDeps: {
		exclude: ["chunk-QTVTVLJO.js"],
	},
	plugins: [
		// MillionLint.vite(),
		remixDevTools(),
		remixCloudflareDevProxy(),
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
			},
			serverModuleFormat: "esm",
			ignoredRouteFiles: ["**/.*"],
			routes: async (defineRoutes) => {
				return flatRoutes("routes", defineRoutes);
			},
		}),
		tsconfigPaths(),
	],
});
