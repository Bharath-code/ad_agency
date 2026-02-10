<script lang="ts">
import { onMount, type Snippet } from 'svelte';

type Props = {
	children: Snippet;
	delay?: number;
	class?: string;
};

const { children, delay = 0, class: className = '' }: Props = $props();
let element: HTMLElement | undefined = $state();
let visible = $state(false);

onMount(() => {
	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				visible = true;
				observer.unobserve(entry.target);
			}
		},
		{ threshold: 0.1 },
	);

	if (element) observer.observe(element);
	return () => observer.disconnect();
});
</script>

<div
    bind:this={element}
    class="reveal-base {visible ? 'reveal-active' : ''} {className}"
    style="transition-delay: {delay}ms"
>
    {@render children()}
</div>
