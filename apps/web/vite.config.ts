import { vitePlugin as remix } from "@remix-run/dev";
import { flatRoutes } from "remix-flat-routes";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import devServer, { defaultOptions } from "@hono/vite-dev-server";
import adapter from "@hono/vite-dev-server/cloudflare";
// import MillionLint from "@million/lint";
import { remixDevTools } from "remix-development-tools";
export default defineConfig({
	ssr: {
		noExternal: ["react-easy-crop", "tslib"],
		resolve: {
			externalConditions: ["workerd", "worker"],
		},
	},
	optimizeDeps: {
		exclude: ["chunk-QTVTVLJO.js"],
	},
	plugins: [
		// MillionLint.vite(),
		remixDevTools(),
		devServer({
			adapter,
			entry: "./server/index",
			exclude: [...defaultOptions.exclude, "/assets/**", "/app/**"],
			injectClientScript: false,
		}),
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
