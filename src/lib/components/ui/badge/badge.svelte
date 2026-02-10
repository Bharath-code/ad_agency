<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { cn } from '$lib/utils.js';
import { badgeVariants, type Variant } from './index.js';

type Props = HTMLAttributes<HTMLDivElement> & {
	variant?: Variant;
	children: Snippet;
};

const { class: className = undefined, variant = 'default', children, ...rest }: Props = $props();
</script>

<div class={cn(badgeVariants({ variant }), className)} {...rest}>
    {@render children()}
</div>
