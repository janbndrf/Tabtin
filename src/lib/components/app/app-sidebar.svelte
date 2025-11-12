<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import ThemeToggle from '$lib/components/theme/theme-toggle.svelte';
	import LanguageSelector from '$lib/components/language/language-selector.svelte';
	import { t } from '$lib/i18n';
	import { LayoutDashboard, FolderKanban, LogOut, Settings, ChevronDown } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import type { ProjectsResponse } from '$lib/pocketbase-types';

	let { projects = [] }: { projects?: ProjectsResponse[] } = $props();

	// Track expanded projects
	let expandedProjects = $state<Set<string>>(new Set());

	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}

	function toggleProject(projectId: string) {
		if (expandedProjects.has(projectId)) {
			expandedProjects.delete(projectId);
		} else {
			expandedProjects.add(projectId);
		}
		expandedProjects = expandedProjects; // Trigger reactivity
	}

	function isExpanded(projectId: string): boolean {
		return expandedProjects.has(projectId);
	}
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<div class="flex items-center justify-between px-2 gap-3">
			<img src="/logo.png" alt="abin Logo" class="h-8 w-8 object-contain" />
			<h2 class="text-lg font-semibold">{t('sidebar.application')}</h2>
		</div>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>{t('nav.dashboard')}</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<a href="/dashboard" class="w-full">
							<Sidebar.MenuButton isActive={isActive('/dashboard')}>
								<LayoutDashboard class="h-4 w-4" />
								<span>{t('nav.dashboard')}</span>
							</Sidebar.MenuButton>
						</a>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<Separator class="my-2" />

		<Sidebar.Group>
			<Sidebar.GroupLabel>{t('sidebar.projects')}</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each projects as project}
						<Sidebar.MenuItem>
							<div class="flex w-full flex-col">
								<div class="flex items-center">
									<a href="/projects/{project.id}" class="flex-1">
										<Sidebar.MenuButton isActive={isActive(`/projects/${project.id}`)}>
											<FolderKanban class="h-4 w-4" />
											<span>{project.name}</span>
										</Sidebar.MenuButton>
									</a>
									<Button
										variant="ghost"
										size="icon-sm"
										class="h-6 w-6 shrink-0"
										onclick={() => toggleProject(project.id)}
									>
										<ChevronDown
											class="h-3 w-3 transition-transform"
											style="transform: rotate({isExpanded(project.id) ? 180 : 0}deg)"
										/>
									</Button>
								</div>
								{#if isExpanded(project.id)}
									<div class="ml-6 mt-1">
										<a href="/projects/{project.id}/settings" class="w-full">
											<Sidebar.MenuButton
												isActive={isActive(`/projects/${project.id}/settings`)}
												class="text-xs"
											>
												<Settings class="h-3 w-3" />
												<span>{t('nav.settings')}</span>
											</Sidebar.MenuButton>
										</a>
									</div>
								{/if}
							</div>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer>
		<div class="flex items-center justify-between gap-2 p-2">
			<div class="flex items-center gap-2">
				<ThemeToggle />
				<LanguageSelector />
			</div>
			<form method="POST" action="/logout" use:enhance class="flex-1">
				<Button type="submit" variant="ghost" size="sm" class="w-full justify-start">
					<LogOut class="mr-2 h-4 w-4" />
					<span>{t('nav.logout')}</span>
				</Button>
			</form>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
