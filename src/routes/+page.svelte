<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { enhance } from '$app/forms';
	import ThemeToggle from '$lib/components/theme/theme-toggle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="relative container mx-auto flex min-h-screen items-center justify-center p-4">
	<div class="absolute right-4 top-4">
		<ThemeToggle />
	</div>
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>SvelteKit + PocketBase Template</CardTitle>
			<CardDescription>
				Combined template with shadcn-svelte components and PocketBase backend
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="rounded-lg border bg-card p-4">
					<p class="text-sm text-muted-foreground">Welcome back!</p>
					<p class="mt-1 font-medium">{data.user?.email}</p>
					{#if data.user?.name}
						<p class="text-sm text-muted-foreground">{data.user.name}</p>
					{/if}
				</div>

				<form method="POST" action="/logout" use:enhance>
					<Button type="submit" variant="outline" class="w-full">Logout</Button>
				</form>
			</div>
		</CardContent>
	</Card>
</div>
