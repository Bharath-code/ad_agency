import { tv, type VariantProps } from 'tailwind-variants';
import Root from './badge.svelte';

export const badgeVariants = tv({
	base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	variants: {
		variant: {
			default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
			secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
			destructive:
				'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
			outline: 'text-foreground',
			success: 'bg-green-100 text-green-800 border-green-200',
			warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
			error: 'bg-red-100 text-red-800 border-red-200',
			brand: 'border-transparent bg-brand text-white hover:bg-brand/80',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export type Variant = VariantProps<typeof badgeVariants>['variant'];

export { Root as Badge, Root };
