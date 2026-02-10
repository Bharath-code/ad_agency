<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { cn } from '$lib/utils.js';

type Props = HTMLAttributes<HTMLDivElement> & {
	children: Snippet;
};

const { class: className = undefined, children, ...rest }: Props = $props();
</script>

<div class={cn("p-6 pt-0", className)} {...rest}>
    {@render children()}
</div>
