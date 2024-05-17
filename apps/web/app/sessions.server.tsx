// sessions.server.tsx

import { createCookie } from "@remix-run/node";

export const prefs = createCookie("prefs", { httpOnly: true, sameSite: "lax" });
