export async function load({ params }) {
	return {
		projectId: params.id,
		batchId: params.batchId
	};
}
