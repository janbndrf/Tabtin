<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { t } from '$lib/i18n';
	import { ArrowLeft, Download } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { pb, currentUser } from '$lib/stores/auth';
	import { projectData, currentProject, isProjectLoading } from '$lib/stores/project-data';
	import type { ImageBatchesResponse, ImagesResponse } from '$lib/pocketbase-types';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/utils/toast';

	interface ExtractionResult {
		column_id: string;
		column_name: string;
		value: string | null;
		image_index: number;
		bbox_2d: [number, number, number, number];
		confidence: number;
	}

	interface BatchWithData extends ImageBatchesResponse {
		images?: ImagesResponse[];
		processed_data: { extractions: ExtractionResult[] } | null;
	}

	interface ColumnDefinition {
		id: string;
		name: string;
		type: string;
		description?: string;
	}

	let { data }: { data: PageData } = $props();

	let approvedBatches = $state<BatchWithData[]>([]);
	let columns = $state<ColumnDefinition[]>([]);
	let loadingProgress = $state({ current: 0, total: 0 });

	onMount(async () => {
		try {
			// Load project data from store (will use cache if available)
			await projectData.loadProject(data.projectId, $currentUser?.id || '');

			if ($currentProject?.settings?.columns) {
				columns = $currentProject.settings.columns;
			}

			await loadApprovedBatches();
		} catch (error) {
			console.error('Failed to load project:', error);
			toast.error(t('images.results.toast.failed_to_load'));
			goto('/dashboard');
		}
	});

	async function loadApprovedBatches() {
		try {
			// Load all approved batches for complete export
			const batchList = await pb.collection('image_batches').getFullList<ImageBatchesResponse>({
				filter: `project = '${data.projectId}' && status = 'approved'`,
				sort: '-created'
			});

			loadingProgress.total = batchList.length;
			approvedBatches = [];

			// Load images for each batch in chunks to avoid overwhelming the browser
			for (let i = 0; i < batchList.length; i++) {
				const batch = batchList[i];
				const images = await pb.collection('images').getFullList<ImagesResponse>({
					filter: `batch = '${batch.id}'`,
					sort: 'order',
					requestKey: `images_${batch.id}`
				});
				approvedBatches.push({ ...batch, images });
				loadingProgress.current = i + 1;
			}
		} catch (error) {
			console.error('Failed to load approved batches:', error);
			toast.error(t('images.results.toast.failed_to_load'));
		}
	}

	function getValueForColumn(batch: BatchWithData, columnId: string): string {
		if (!batch.processed_data) return '';
		const extraction = batch.processed_data.extractions.find(e => e.column_id === columnId);
		return extraction?.value ?? '';
	}

	function exportToCSV() {
		if (approvedBatches.length === 0 || columns.length === 0) return;

		const headers = ['Batch ID', 'Created', ...columns.map(col => col.name)];
		const rows = approvedBatches.map(batch => {
			const row = [
				batch.id.slice(0, 8),
				new Date(batch.created).toLocaleDateString(),
				...columns.map(col => getValueForColumn(batch, col.id))
			];
			return row.map(val => `"${val}"`).join(',');
		});

		const csvContent = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${$currentProject?.name || 'project'}-results-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success(t('images.results.toast.exported'));
	}
</script>

{#if $isProjectLoading}
	<div class="flex flex-col items-center justify-center gap-2 p-8">
		<p>{t('images.results.loading')}</p>
		{#if loadingProgress.total > 0}
			<p class="text-sm text-muted-foreground">
				Loading batch {loadingProgress.current} of {loadingProgress.total}
			</p>
		{/if}
	</div>
{:else if $currentProject}
	<div class="flex flex-col gap-4 p-4">
		<div class="flex items-center gap-2">
			<Button variant="ghost" size="icon" href="/projects/{data.projectId}">
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div class="flex-1">
				<h2 class="text-2xl font-bold tracking-tight">{t('images.results.title')}</h2>
			</div>
			{#if approvedBatches.length > 0}
				<Button onclick={exportToCSV} variant="outline" size="sm">
					<Download class="h-4 w-4 sm:mr-2" />
					<span class="hidden sm:inline">{t('images.results.export_all')}</span>
				</Button>
			{/if}
		</div>

		{#if approvedBatches.length === 0}
			<div class="flex items-center justify-center p-12 text-muted-foreground">
				<p>{t('images.results.empty_state')}</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Batch</Table.Head>
							<Table.Head>Created</Table.Head>
							{#each columns as column}
								<Table.Head>{column.name}</Table.Head>
							{/each}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each approvedBatches as batch}
							<Table.Row>
								<Table.Cell class="font-mono text-xs">{batch.id.slice(0, 8)}</Table.Cell>
								<Table.Cell class="text-xs">{new Date(batch.created).toLocaleDateString()}</Table.Cell>
								{#each columns as column}
									<Table.Cell>{getValueForColumn(batch, column.id) || 'N/A'}</Table.Cell>
								{/each}
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{/if}
	</div>
{/if}
