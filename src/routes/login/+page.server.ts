import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If user is already authenticated, redirect to dashboard
	if (locals.pb?.authStore?.isValid) {
		throw redirect(303, '/dashboard');
	}

	return {};
};
