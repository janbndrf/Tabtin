<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { t } from '$lib/i18n';
	import { FolderKanban, Plus } from 'lucide-svelte';
	import CreateProjectDialog from '$lib/components/projects/create-project-dialog.svelte';
	import type { PageData } from './$types';
	import { projectsStore } from '$lib/stores/projects.svelte';

	let { data }: { data: PageData } = $props();

	let createDialogOpen = $state(false);

	function handleProjectCreated() {
		createDialogOpen = false;
	}

	function formatDate(dateString: string): string {
		if (!dateString) return '';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return '';
		return new Intl.DateTimeFormat(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(date);
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<!-- Welcome Section -->
	<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">{t('dashboard.welcome')}</h2>
			{#if data.user?.name}
				<p class="text-muted-foreground">{data.user.name}</p>
			{/if}
		</div>
		<Button class="w-full md:w-auto" onclick={() => (createDialogOpen = true)}>
			<Plus class="mr-2 h-4 w-4" />
			{t('dashboard.projects.create_button')}
		</Button>
	</div>

	<!-- Projects Section -->
	<div class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold">{t('dashboard.projects.title')}</h3>
		</div>

		{#if projectsStore.projects.length === 0}
			<!-- Empty State -->
			<Card class="border-dashed">
				<CardContent class="flex flex-col items-center justify-center py-12">
					<FolderKanban class="mb-4 h-12 w-12 text-muted-foreground" />
					<h3 class="mb-2 text-lg font-semibold">{t('dashboard.projects.empty')}</h3>
					<p class="mb-4 text-center text-sm text-muted-foreground">
						{t('dashboard.projects.empty_description')}
					</p>
					<Button onclick={() => (createDialogOpen = true)}>
						<Plus class="mr-2 h-4 w-4" />
						{t('dashboard.projects.create_button')}
					</Button>
				</CardContent>
			</Card>
		{:else}
			<!-- Projects Grid -->
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each projectsStore.projects as project}
					<a href="/projects/{project.id}" class="group">
						<Card class="transition-shadow hover:shadow-md">
							<CardHeader>
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<CardTitle class="group-hover:text-primary">{project.name}</CardTitle>
									</div>
									<FolderKanban class="h-5 w-5 text-muted-foreground" />
								</div>
							</CardHeader>
							<CardContent>
								<div class="flex items-center justify-between text-sm text-muted-foreground">
									<span>{formatDate(project.created || '')}</span>
								</div>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

<CreateProjectDialog bind:open={createDialogOpen} onSuccess={handleProjectCreated} />
