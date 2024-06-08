// Extend the Window interface
declare global {
	interface Window {
		ENV: {
			REPLICACHE_KEY: string;
			WORKER_URL: string;
			PARTYKIT_HOST: string;
			MEDIA_URL: string;
		};
	}
}

// This export is needed to convert this file into a module
export type {};
