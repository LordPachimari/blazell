// sessions.server.tsx

import { createCookieSessionStorage, createCookie } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";
import { env } from "./env";

const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "theme_storage",
		// domain: 'remix.run',
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secrets: [env.SESSION_SECRET],
		// secure: true,
	},
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);

export const prefs = createCookie("prefs", { httpOnly: true, sameSite: "lax" });
