// API endpoint to cancel queued/processing jobs

import { json } from '@sveltejs/kit';
import { getQueueManager } from '$lib/server/queue';
import { env } from '$env/dynamic/private';
import PocketBase from 'pocketbase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { projectId, batchIds } = await request.json();

		if (!projectId) {
			return json(
				{
					success: false,
					error: 'projectId is required'
				},
				{ status: 400 }
			);
		}

		const queueManager = getQueueManager();
		const pb = new PocketBase(env.POCKETBASE_URL);
		await pb.admins.authWithPassword(
			env.POCKETBASE_ADMIN_EMAIL,
			env.POCKETBASE_ADMIN_PASSWORD
		);

		// Cancel queued/processing jobs for this project (optionally filtered by batchIds)
		const canceledCount = await queueManager.cancelQueuedJobs(projectId, batchIds);

		// Also reset batch statuses to prevent auto-re-queueing
		// Get all batches that are pending or processing for this project
		let filter = `project = "${projectId}" && (status = "pending" || status = "processing")`;
		if (batchIds && batchIds.length > 0) {
			const batchFilter = batchIds.map((id: string) => `id = "${id}"`).join(' || ');
			filter = `${filter} && (${batchFilter})`;
		}

		const batches = await pb.collection('image_batches').getFullList({
			filter
		});

		// Reset batch statuses to failed with cancellation message
		for (const batch of batches) {
			await pb.collection('image_batches').update(batch.id, {
				status: 'failed',
				error_message: 'Processing canceled by user'
			});
		}

		return json({
			success: true,
			canceledCount,
			batchesReset: batches.length,
			message: `${canceledCount} job${canceledCount === 1 ? '' : 's'} canceled, ${batches.length} batch${batches.length === 1 ? '' : 'es'} reset`
		});
	} catch (error: any) {
		console.error('Error canceling jobs:', error);
		return json(
			{
				success: false,
				error: error.message
			},
			{ status: 500 }
		);
	}
};
