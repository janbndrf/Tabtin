import { z } from 'zod/v4';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const registerSchema = z
	.object({
		name: z.string().min(2),
		email: z.string().email(),
		password: z.string().min(8),
		passwordConfirm: z.string().min(8)
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'Passwords do not match',
		path: ['passwordConfirm']
	});

export const load: PageServerLoad = async ({ locals }) => {
	// If user is already authenticated, redirect to dashboard
	if (locals.pb?.authStore?.isValid) {
		throw redirect(303, '/dashboard');
	}

	return {
		form: await superValidate(zod4(registerSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(registerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await locals.pb.collection('users').create({
				name: form.data.name,
				email: form.data.email,
				password: form.data.password,
				passwordConfirm: form.data.passwordConfirm
			});

			await locals.pb.collection('users').authWithPassword(form.data.email, form.data.password);
		} catch (error: any) {
			const errorMessage =
				error?.message?.includes('email') || error?.response?.data?.email
					? 'An account with this email already exists'
					: 'An error occurred. Please try again.';

			return fail(400, {
				form,
				error: errorMessage
			});
		}

		throw redirect(303, '/');
	}
};
