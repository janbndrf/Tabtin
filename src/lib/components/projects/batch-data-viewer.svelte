<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Download, X, Image as ImageIcon } from 'lucide-svelte';
	import { pb } from '$lib/stores/auth';
	import type { ImagesResponse } from '$lib/pocketbase-types';

	interface ExtractionResult {
		column_id: string;
		column_name: string;
		value: string | null;
		image_index: number;
		bbox_2d: [number, number, number, number];
		confidence: number;
	}

	interface Props {
		open: boolean;
		batchId: string;
		extractedData: { extractions: ExtractionResult[] } | null;
		images: ImagesResponse[];
		reviewMode?: boolean;
		onClose: () => void;
		onSave?: (data: { extractions: ExtractionResult[] }) => void;
	}

	let { open = $bindable(), batchId, extractedData, images, reviewMode = false, onClose, onSave }: Props = $props();

	let selectedImageIndex = $state<number | null>(null);
	let selectedField = $state<string | null>(null);
	let editableData = $state<{ extractions: ExtractionResult[] } | null>(null);
	let hasChanges = $state(false);

	// Initialize editable data when extractedData changes
	$effect(() => {
		if (extractedData) {
			editableData = JSON.parse(JSON.stringify(extractedData));
			hasChanges = false;
		}
	});

	function getImageUrl(imageIndex: number) {
		const image = images[imageIndex];
		if (!image) return '';
		return pb.files.getURL(image, image.image);
	}

	function exportToCSV() {
		const data = reviewMode ? editableData : extractedData;
		if (!data) return;

		const headers = data.extractions.map((e) => e.column_name);
		const values = data.extractions.map((e) => e.value ?? '');

		const csvContent = [headers.join(','), values.join(',')].join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `batch-${batchId.slice(0, 8)}-data.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function highlightField(field: ExtractionResult) {
		selectedImageIndex = field.image_index;
		selectedField = field.column_id;
	}

	function updateFieldValue(columnId: string, newValue: string | null) {
		if (!editableData) return;

		const field = editableData.extractions.find((e) => e.column_id === columnId);
		if (field) {
			field.value = newValue;
			hasChanges = true;
		}
	}

	async function saveChanges() {
		if (!editableData || !onSave) return;

		try {
			// Update the batch in PocketBase
			await pb.collection('image_batches').update(batchId, {
				processed_data: editableData
			});

			onSave(editableData);
			hasChanges = false;
		} catch (error) {
			console.error('Failed to save changes:', error);
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-6xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>
				{reviewMode ? 'Review' : 'View'} Data - Batch {batchId.slice(0, 8)}
				{#if reviewMode && hasChanges}
					<span class="text-sm text-orange-500 ml-2">(Unsaved changes)</span>
				{/if}
			</Dialog.Title>
		</Dialog.Header>

		{#if editableData}
			<div class="space-y-6">
				<!-- Action Buttons -->
				<div class="flex justify-end gap-2">
					{#if reviewMode && hasChanges}
						<Button onclick={saveChanges} size="sm">
							Save Changes
						</Button>
					{/if}
					<Button onclick={exportToCSV} variant="outline" size="sm">
						<Download class="mr-2 h-4 w-4" />
						Export CSV
					</Button>
				</div>

				<!-- Data Table -->
				<Card>
					<CardHeader>
						<CardTitle class="text-base">Extracted Fields</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="overflow-x-auto">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Field</Table.Head>
										<Table.Head>Value</Table.Head>
										<Table.Head>Image</Table.Head>
										<Table.Head>Confidence</Table.Head>
										<Table.Head>Action</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each extractedData.extractions as extraction}
										<Table.Row class={selectedField === extraction.column_id ? 'bg-accent' : ''}>
											<Table.Cell class="font-medium">{extraction.column_name}</Table.Cell>
											<Table.Cell>
												{extraction.value ?? 'N/A'}
											</Table.Cell>
											<Table.Cell>
												<div class="flex items-center gap-1">
													<ImageIcon class="h-4 w-4" />
													<span>{extraction.image_index + 1}</span>
												</div>
											</Table.Cell>
											<Table.Cell>
												<span class={extraction.confidence >= 0.8 ? 'text-green-600' : extraction.confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600'}>
													{(extraction.confidence * 100).toFixed(0)}%
												</span>
											</Table.Cell>
											<Table.Cell>
												<Button
													size="sm"
													variant="ghost"
													onclick={() => highlightField(extraction)}
												>
													View
												</Button>
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</CardContent>
				</Card>

				<!-- Image Viewer with Bounding Boxes -->
				{#if selectedImageIndex !== null}
					<Card>
						<CardHeader>
							<div class="flex items-center justify-between">
								<CardTitle class="text-base">Image {selectedImageIndex + 1}</CardTitle>
								<Button
									size="sm"
									variant="ghost"
									onclick={() => {
										selectedImageIndex = null;
										selectedField = null;
									}}
								>
									<X class="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div class="relative inline-block">
								<img
									src={getImageUrl(selectedImageIndex)}
									alt="Selected"
									class="max-w-full rounded-lg"
								/>
								{#if selectedField}
									{@const field = extractedData.extractions.find((e) => e.column_id === selectedField)}
									{#if field && field.bbox_2d[0] !== 0 && field.bbox_2d[1] !== 0}
										<div
											class="absolute border-2 border-primary bg-primary/20"
											style="left: {field.bbox_2d[0]}px; top: {field.bbox_2d[1]}px; width: {field.bbox_2d[2] - field.bbox_2d[0]}px; height: {field.bbox_2d[3] - field.bbox_2d[1]}px;"
										>
											<div class="absolute -top-6 left-0 bg-primary px-2 py-1 text-xs text-primary-foreground rounded">
												{field.column_name}
											</div>
										</div>
									{/if}
								{/if}
							</div>
						</CardContent>
					</Card>
				{/if}
			</div>
		{:else}
			<div class="py-12 text-center text-muted-foreground">
				No extracted data available
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={onClose}>
				Close
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
