<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Languages } from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { locales, cookieName } from '$lib/paraglide/runtime';

	// Get current locale from cookie
	function getCurrentLocale(): string {
		if (typeof document === 'undefined') return 'en';
		const cookies = document.cookie.split(';');
		for (const cookie of cookies) {
			const [name, value] = cookie.trim().split('=');
			if (name === cookieName) {
				return value;
			}
		}
		return 'en';
	}

	let currentLocale = $state(getCurrentLocale());

	const languageNames: Record<string, string> = {
		en: 'English',
		de: 'Deutsch'
	};

	function handleLanguageChange(lang: string) {
		// Set cookie and reload
		document.cookie = `${cookieName}=${lang}; path=/; max-age=31536000`;
		currentLocale = lang;
		window.location.reload();
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" aria-label={t('language.select')}>
				<Languages class="h-5 w-5" />
				<span class="sr-only">{t('language.select')}</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>{t('language.select')}</DropdownMenu.Label>
		<DropdownMenu.Separator />
		{#each locales as lang}
			<DropdownMenu.CheckboxItem
				checked={currentLocale === lang}
				onCheckedChange={() => handleLanguageChange(lang)}
			>
				{languageNames[lang] || lang}
			</DropdownMenu.CheckboxItem>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
