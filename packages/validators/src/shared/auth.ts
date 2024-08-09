import { z } from "zod";
import type { Session } from "../server/entities";

type AuthUser = {
	id: string;
	email: string;
	username: string | null;
};
type AuthSession = Session & { fresh: boolean };
type Auth = {
	user: AuthUser | null;
	session: AuthSession | null;
};
const GoogleProfileSchema = z.object({
	sub: z.string(), // User's unique ID
	name: z.string().optional(), // Full name
	given_name: z.string().optional(), // First name
	family_name: z.string().optional(), // Last name
	email: z.string().email().optional(), // Email address
	email_verified: z.boolean().optional(), // Whether the email is verified
	picture: z.string().url().optional(), // Profile picture URL
	locale: z.string().optional(), // User's locale
	hd: z.string().optional(), // Hosted domain (if user is part of a Google Apps domain)
});
type GoogleProfile = z.infer<typeof GoogleProfileSchema>;

export type { AuthUser, AuthSession, Auth, GoogleProfile };
export { GoogleProfileSchema };
