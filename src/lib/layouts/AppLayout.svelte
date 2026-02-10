<script lang="ts">
import Sidebar from '../components/layout/Sidebar.svelte';

const { children } = $props();
</script>

<div class="app-shell">
    <Sidebar />
    <main class="app-main">
        {@render children()}
    </main>
</div>

<style>
    .app-shell {
        display: flex;
        min-height: 100vh;
    }

    .app-main {
        flex: 1;
        margin-left: 240px;
        background: var(--bg-secondary);
        min-height: 100vh;
    }
</style>
