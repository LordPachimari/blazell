import {
	vitePlugin as remix,
	cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { remixDevTools } from "remix-development-tools";
import { flatRoutes } from "remix-flat-routes";
import { getLoadContext } from "./load-context";
import MillionLint from "@million/lint";
export default defineConfig({
	ssr: {
		noExternal: ["react-easy-crop", "tslib"],
	},
	build: {
		target: "ES2022",
	},
	plugins: [
		MillionLint.vite(),
		remixDevTools(),
		remixCloudflareDevProxy({ getLoadContext }),
		remix({
			serverModuleFormat: "esm",
			ignoredRouteFiles: ["**/.*"],
			routes: async (defineRoutes) => {
				return flatRoutes("routes", defineRoutes);
			},
		}),
		tsconfigPaths(),
	],
});
