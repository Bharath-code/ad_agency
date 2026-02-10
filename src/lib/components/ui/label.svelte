<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLLabelAttributes } from 'svelte/elements';
import { cn } from '$lib/utils.js';

type Props = HTMLLabelAttributes & {
	children: Snippet;
};

const { class: className = undefined, children, ...rest }: Props = $props();
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<label
    class={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
    )}
    {...rest}
>
    {@render children()}
</label>
