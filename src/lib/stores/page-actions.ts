import { writable } from 'svelte/store';

export type PageAction = {
	label: string;
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
	disabled?: boolean;
	icon?: any;
	onclick: () => void;
	class?: string;
};

export const pageActions = writable<PageAction[]>([]);

export function setPageActions(actions: PageAction[]) {
	pageActions.set(actions);
}

export function clearPageActions() {
	pageActions.set([]);
}
