<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { cn } from '$lib/utils.js';

type Props = HTMLAttributes<HTMLParagraphElement> & {
	children: Snippet;
};

const { class: className = undefined, children, ...rest }: Props = $props();
</script>

<p class={cn("text-muted-foreground text-sm", className)} {...rest}>
    {@render children()}
</p>
