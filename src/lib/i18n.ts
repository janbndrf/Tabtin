import * as m from '$lib/paraglide/messages';

/**
 * Helper function to access Paraglide messages with dot notation
 * @param key - Message key using dot notation (e.g., 'dashboard.title')
 * @param params - Optional parameters for message interpolation
 * @returns The translated message string
 */
export const t = (key: string, params?: Record<string, any>): string => {
	const fn = m[key as keyof typeof m] as ((params?: any) => string) | undefined;
	if (!fn) {
		console.warn(`Translation key not found: ${key}`);
		return key;
	}
	return fn(params);
};
