<script lang="ts">
import { Loader2 } from 'lucide-svelte';
import { cn } from '$lib/utils.js';

type Props = {
	size?: 'sm' | 'md' | 'lg';
	class?: string;
};

const { size = 'md', class: className = undefined }: Props = $props();

const sizes = {
	sm: 'w-4 h-4',
	md: 'w-6 h-6',
	lg: 'w-10 h-10',
};
</script>

<Loader2
    class={cn("animate-spin text-muted-foreground", sizes[size], className)}
/>
