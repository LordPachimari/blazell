// Extend the Window interface
declare global {
	interface Window {
		ENV: {
			REPLICACHE_KEY: string;
			PARTYKIT_HOST: string;
		};
	}
}

// This export is needed to convert this file into a module
export type {};
