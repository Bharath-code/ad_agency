<script lang="ts">
import * as Card from '$lib/components/ui/card/index.js';
import Skeleton from '$lib/components/ui/skeleton.svelte';
</script>

<div class="dashboard-skeleton">
    <!-- Score Card Skeleton -->
    <Card.Root class="score-card-skeleton mb-6">
        <Card.Header class="pb-2">
            <div class="flex items-center justify-between">
                <Skeleton class="h-6 w-32" />
                <Skeleton class="h-5 w-24 rounded-full" />
            </div>
        </Card.Header>
        <Card.Content>
            <div
                class="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <Skeleton class="h-16 w-32 mt-2 mb-2" />
                    <Skeleton class="h-4 w-40" />
                </div>
                <div class="flex gap-8 pb-1">
                    <div class="space-y-2">
                        <Skeleton class="h-4 w-16" />
                        <Skeleton class="h-6 w-12" />
                    </div>
                    <div class="space-y-2">
                        <Skeleton class="h-4 w-20" />
                        <Skeleton class="h-6 w-12" />
                    </div>
                </div>
            </div>

            <div class="mt-8 space-y-3">
                <div class="flex items-center justify-between">
                    <Skeleton class="h-4 w-16" />
                    <Skeleton class="h-4 w-8" />
                </div>
                <!-- Progress bar skeleton -->
                <div
                    class="flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
                >
                    <Skeleton class="h-full w-1/3" />
                    <Skeleton class="h-full w-1/4 bg-slate-200" />
                </div>
                <div class="flex justify-between text-xs mt-2">
                    <div class="flex gap-4">
                        <div class="flex items-center gap-1">
                            <div
                                class="w-2 h-2 rounded-full bg-emerald-500"
                            ></div>
                            <Skeleton class="h-3 w-16" />
                        </div>
                        <div class="flex items-center gap-1">
                            <div
                                class="w-2 h-2 rounded-full bg-amber-400"
                            ></div>
                            <Skeleton class="h-3 w-20" />
                        </div>
                        <div class="flex items-center gap-1">
                            <div
                                class="w-2 h-2 rounded-full bg-slate-300"
                            ></div>
                            <Skeleton class="h-3 w-24" />
                        </div>
                    </div>
                </div>
            </div>
        </Card.Content>
        <div
            class="border-t border-slate-100 p-6 flex flex-col md:flex-row items-center justify-center gap-4"
        >
            <Skeleton class="h-10 w-full md:w-40 rounded-md" />
            <Skeleton class="h-4 w-32" />
        </div>
    </Card.Root>

    <!-- Battle Section Skeleton -->
    <Card.Root class="mb-6">
        <Card.Header>
            <div class="flex items-center gap-2">
                <Skeleton class="h-5 w-5 rounded-full" />
                <Skeleton class="h-6 w-48" />
            </div>
        </Card.Header>
        <Card.Content>
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            >
                {#each Array(3) as _}
                    <div class="p-4 rounded-xl border border-slate-100">
                        <div class="flex items-center gap-3 mb-3">
                            <Skeleton class="h-8 w-8 rounded-full" />
                            <Skeleton class="h-5 w-24" />
                        </div>
                        <Skeleton class="h-8 w-16 mb-1" />
                        <Skeleton class="h-3 w-20 mb-3" />
                        <div
                            class="w-full bg-slate-100 rounded-full h-2 mb-4"
                        ></div>
                        <div class="space-y-2">
                            <Skeleton class="h-3 w-3/4" />
                            <Skeleton class="h-3 w-5/6" />
                        </div>
                    </div>
                {/each}
            </div>

            <div class="mt-6">
                <Skeleton class="h-5 w-32 mb-4" />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#each Array(2) as _}
                        <div class="p-4 border border-slate-100 rounded-lg">
                            <Skeleton class="h-4 w-32 mb-3" />
                            <div class="space-y-2">
                                <Skeleton class="h-3 w-full" />
                                <Skeleton class="h-3 w-5/6" />
                                <Skeleton class="h-3 w-4/5" />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </Card.Content>
    </Card.Root>

    <!-- Insights Grid Skeleton -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Top Wins -->
        <Card.Root>
            <Card.Header>
                <div class="flex items-center gap-2">
                    <Skeleton class="h-5 w-5 rounded-md" />
                    <Skeleton class="h-6 w-32" />
                </div>
                <Skeleton class="h-4 w-48 mt-1" />
            </Card.Header>
            <Card.Content>
                <div class="space-y-4">
                    {#each Array(2) as _}
                        <div
                            class="p-4 rounded-lg border border-emerald-100 bg-emerald-50/30"
                        >
                            <div class="flex justify-between items-start mb-2">
                                <Skeleton class="h-5 w-3/4" />
                                <Skeleton class="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton class="h-4 w-full" />
                            <Skeleton class="h-4 w-5/6 mt-1" />
                        </div>
                    {/each}
                </div>
            </Card.Content>
        </Card.Root>

        <!-- Top Misses -->
        <Card.Root>
            <Card.Header>
                <div class="flex items-center gap-2">
                    <Skeleton class="h-5 w-5 rounded-md" />
                    <Skeleton class="h-6 w-40" />
                </div>
                <Skeleton class="h-4 w-56 mt-1" />
            </Card.Header>
            <Card.Content>
                <div class="space-y-4">
                    {#each Array(2) as _}
                        <div
                            class="p-4 rounded-lg border border-rose-100 bg-rose-50/30"
                        >
                            <div class="flex justify-between items-start mb-2">
                                <Skeleton class="h-5 w-2/3" />
                                <Skeleton class="h-5 w-20 rounded-full" />
                            </div>
                            <div
                                class="space-y-2 mt-3 pl-3 border-l-2 border-rose-200"
                            >
                                <Skeleton class="h-3 w-full" />
                                <Skeleton class="h-3 w-4/5" />
                            </div>
                        </div>
                    {/each}
                </div>
            </Card.Content>
        </Card.Root>
    </div>

    <!-- Recommended Fixes Skeleton -->
    <Card.Root class="mb-6">
        <Card.Header>
            <div class="flex items-center gap-2">
                <Skeleton class="h-5 w-5 rounded-md" />
                <Skeleton class="h-6 w-48" />
            </div>
            <Skeleton class="h-4 w-64 mt-1" />
        </Card.Header>
        <Card.Content>
            <div class="space-y-4">
                {#each Array(3) as _}
                    <div class="p-5 rounded-lg border border-slate-100">
                        <Skeleton class="h-5 w-2/5 mb-4" />
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {#each Array(3) as _}
                                <div class="bg-slate-50 p-3 rounded-md">
                                    <div class="flex items-center gap-2 mb-2">
                                        <Skeleton class="h-4 w-4 rounded-sm" />
                                        <Skeleton class="h-3 w-20" />
                                    </div>
                                    <Skeleton class="h-4 w-full" />
                                    <Skeleton class="h-4 w-4/5 mt-1" />
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </Card.Content>
    </Card.Root>
</div>
