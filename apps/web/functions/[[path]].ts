import { handle } from "hono/cloudflare-pages";
import server from "../server/index";

export const onRequest = handle(server);
