import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.pb?.authStore?.model) {
		throw redirect(303, '/login');
	}

	// Redirect authenticated users to dashboard
	throw redirect(303, '/dashboard');
};
