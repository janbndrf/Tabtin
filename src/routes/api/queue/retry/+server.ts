// API endpoint to retry failed jobs

import { json } from '@sveltejs/kit';
import { getQueueManager } from '$lib/server/queue';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { jobId, projectId, retryAll } = await request.json();
		const queueManager = getQueueManager();

		if (retryAll) {
			const count = await queueManager.retryAllFailed(projectId);

			return json({
				success: true,
				message: `${count} failed jobs queued for retry`
			});
		} else if (jobId) {
			await queueManager.retryFailed(jobId);

			return json({
				success: true,
				message: 'Job queued for retry'
			});
		} else {
			return json(
				{
					success: false,
					error: 'Either jobId or retryAll must be provided'
				},
				{ status: 400 }
			);
		}
	} catch (error: any) {
		console.error('Error retrying job:', error);
		return json(
			{
				success: false,
				error: error.message
			},
			{ status: 500 }
		);
	}
};
