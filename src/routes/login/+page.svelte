<script lang="ts">
	import { z } from 'zod/v4';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import ThemeToggle from '$lib/components/theme/theme-toggle.svelte';
	import { pb } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import * as m from '$paraglide/messages';

	const loginSchema = z.object({
		email: z.string().email('Please enter a valid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters')
	});

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let error = $state('');
	let isLoading = $state(false);
	let emailError = $state('');
	let passwordError = $state('');
	let debugInfo = $state('');

	// Debug: Log PocketBase URL on component mount
	$effect(() => {
		debugInfo = `PocketBase URL: ${pb.baseUrl}`;
		console.log('PocketBase URL:', pb.baseUrl);
		console.log('Current auth state:', pb.authStore.model);
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		emailError = '';
		passwordError = '';
		isLoading = true;

		// Validate
		const result = loginSchema.safeParse({ email, password });
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			emailError = errors.email?.[0] || '';
			passwordError = errors.password?.[0] || '';
			isLoading = false;
			return;
		}

		try {
			console.log('Attempting login with URL:', pb.baseUrl);
			console.log('Email:', email);
			console.log('Remember me:', rememberMe);

			// Authenticate with PocketBase
			const authData = await pb.collection('users').authWithPassword(email, password);

			// Store remember me preference
			if (rememberMe) {
				localStorage.setItem('pb_remember_me', 'true');
				// Enable auto-refresh to keep token alive
				pb.autoCancellation(false);
			} else {
				localStorage.removeItem('pb_remember_me');
			}

			console.log('Login successful:', authData);
			goto('/dashboard');
		} catch (err: any) {
			console.error('Login error details:', {
				message: err.message,
				status: err.status,
				data: err.data,
				isAbort: err.isAbort,
				originalError: err
			});
			error = `${err.message || 'Invalid email or password'} (Status: ${err.status || 'unknown'})`;
			debugInfo = `Error: ${err.message}\nStatus: ${err.status}\nURL: ${pb.baseUrl}\nData: ${JSON.stringify(err.data || {})}`;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="relative flex min-h-screen items-center justify-center bg-background p-4">
	<div class="absolute right-4 top-4">
		<ThemeToggle />
	</div>
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-2xl">Welcome Back</Card.Title>
			<Card.Description>Sign in to your account to continue</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleLogin} class="space-y-4">
				<div class="space-y-2">
					<label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
					<Input
						id="email"
						type="email"
						placeholder="name@example.com"
						bind:value={email}
						autocomplete="email"
						disabled={isLoading}
					/>
					{#if emailError}
						<p class="text-sm font-medium text-destructive">{emailError}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
					<Input
						id="password"
						type="password"
						placeholder="Enter your password"
						bind:value={password}
						autocomplete="current-password"
						disabled={isLoading}
					/>
					{#if passwordError}
						<p class="text-sm font-medium text-destructive">{passwordError}</p>
					{/if}
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox id="remember-me" bind:checked={rememberMe} disabled={isLoading} />
					<label
						for="remember-me"
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
					>
						{m['auth.login.remember_me_label']()}
					</label>
				</div>

				{#if error}
					<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						{error}
					</div>
				{/if}

				{#if debugInfo}
					<div class="rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap break-all">
						{debugInfo}
					</div>
				{/if}

				<Button type="submit" class="w-full" disabled={isLoading}>
					{isLoading ? 'Signing in...' : 'Sign In'}
				</Button>
			</form>

			<div class="mt-4 text-center text-sm">
				<span class="text-muted-foreground">Don't have an account?</span>
				<a href="/register" class="ml-1 text-primary hover:underline">Register here</a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
