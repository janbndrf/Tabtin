import { toast as sonnerToast, type ExternalToast } from 'svelte-sonner';

const horizontalSwipe = { swipeDirections: ['left', 'right'] } as const;

export const toast = {
	success: (message: string, data?: ExternalToast) => {
		return sonnerToast.success(message, {
			...horizontalSwipe,
			...data
		} as ExternalToast);
	},
	error: (message: string, data?: ExternalToast) => {
		return sonnerToast.error(message, {
			...horizontalSwipe,
			...data
		} as ExternalToast);
	},
	info: (message: string, data?: ExternalToast) => {
		return sonnerToast.info(message, {
			...horizontalSwipe,
			...data
		} as ExternalToast);
	},
	warning: (message: string, data?: ExternalToast) => {
		return sonnerToast.warning(message, {
			...horizontalSwipe,
			...data
		} as ExternalToast);
	},
	message: (message: string, data?: ExternalToast) => {
		return sonnerToast.message(message, {
			...horizontalSwipe,
			...data
		} as ExternalToast);
	},
	promise: sonnerToast.promise,
	custom: sonnerToast.custom,
	dismiss: sonnerToast.dismiss,
	loading: (message: string, data?: ExternalToast) => {
		return sonnerToast.loading(message, {
			...horizontalSwipe,
			...data
		} as ExternalToast);
	}
};
