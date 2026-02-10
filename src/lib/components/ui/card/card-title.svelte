<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { cn } from '$lib/utils.js';

type Props = HTMLAttributes<HTMLHeadingElement> & {
	children: Snippet;
};

const { class: className = undefined, children, ...rest }: Props = $props();
</script>

<h3
    class={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...rest}
>
    {@render children()}
</h3>
