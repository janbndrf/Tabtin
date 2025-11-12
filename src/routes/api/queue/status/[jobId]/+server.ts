// API endpoint to get job status

import { json } from '@sveltejs/kit';
import { getQueueManager } from '$lib/server/queue';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { jobId } = params;
		const queueManager = getQueueManager();

		const job = await queueManager.getJob(jobId);

		if (!job) {
			return json(
				{
					success: false,
					error: 'Job not found'
				},
				{ status: 404 }
			);
		}

		return json({
			success: true,
			job
		});
	} catch (error: any) {
		console.error('Error getting job status:', error);
		return json(
			{
				success: false,
				error: error.message
			},
			{ status: 500 }
		);
	}
};
