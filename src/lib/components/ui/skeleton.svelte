<script lang="ts">
    import { cn } from "$lib/utils";
    let { class: className, ...rest } = $props<{
        class?: string;
        [key: string]: any;
    }>();
</script>

<div class={cn("animate-pulse rounded-md bg-muted", className)} {...rest}></div>
