import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod/v4';
import type { PageServerLoad } from './$types';

const projectSchema = z.object({
	name: z.string().min(2, 'Project name must be at least 2 characters')
});

export const load: PageServerLoad = async () => {
	// Initialize the form
	const form = await superValidate(zod4(projectSchema));

	return {
		projects: [],
		form
	};
};
