<script lang="ts">
import type { Snippet } from 'svelte';
import * as Button from '$lib/components/ui/button/index.js';
import { cn } from '$lib/utils.js';

type Props = {
	title: string;
	description: string;
	actionLabel?: string;
	onaction?: () => void;
	class?: string;
	icon?: Snippet;
};

const {
	title,
	description,
	actionLabel,
	onaction,
	class: className = undefined,
	icon,
}: Props = $props();
</script>

<div
    class={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className,
    )}
>
    {#if icon}
        <div class="mb-4 text-muted-foreground">
            {@render icon()}
        </div>
    {/if}
    <h3 class="text-xl font-semibold mb-2">{title}</h3>
    <p class="text-muted-foreground mb-6 max-w-sm">{description}</p>
    {#if actionLabel && onaction}
        <Button.Root variant="brand" onclick={onaction}>
            {actionLabel}
        </Button.Root>
    {/if}
</div>
