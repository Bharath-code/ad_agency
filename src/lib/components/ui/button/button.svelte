<script lang="ts">
import type { Props } from './index.js';
import { buttonVariants } from './index.js';

const {
	class: className = undefined,
	variant = 'default',
	size = 'default',
	href = undefined,
	children,
	...rest
}: Props = $props();
</script>

{#if href}
	<a
		{href}
		class={buttonVariants({ variant, size, class: String(className ?? '') })}
		{...rest as any}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		class={buttonVariants({ variant, size, class: String(className ?? '') })}
		{...rest as any}
	>
		{@render children?.()}
	</button>
{/if}
