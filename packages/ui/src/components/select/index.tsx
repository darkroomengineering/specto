import { cn } from '../../utils/cn'

export interface SelectOption {
	value: string
	label: string
	disabled?: boolean
}

export interface SelectProps {
	value: string
	onChange: (value: string) => void
	options: SelectOption[]
	className?: string
	size?: 'sm' | 'md'
}

export function Select({ value, onChange, options, className, size = 'md' }: SelectProps) {
	const sizeClasses = {
		sm: 'px-2 py-1 text-xs',
		md: 'px-3 py-1.5 text-sm',
	}

	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className={cn(
				'rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]',
				'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
				'cursor-pointer appearance-none',
				'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.25rem_center] bg-no-repeat pr-8',
				sizeClasses[size],
				className
			)}
		>
			{options.map((option) => (
				<option key={option.value} value={option.value} disabled={option.disabled}>
					{option.label}
				</option>
			))}
		</select>
	)
}
