<script>
import '../app.css';
import Toast from '$lib/components/ui/toast.svelte';

const { children } = $props();
</script>

<Toast />
{@render children()}
