import { Card, Skeleton } from '@specto/ui'
import { AnimatePresence, motion } from 'motion/react'

interface OrganizationSkeletonProps {
	isVisible: boolean
}

/**
 * Coordinated skeleton loading state for the organization page.
 * Shows a unified skeleton that mirrors the actual layout structure.
 */
export function OrganizationSkeleton({ isVisible }: OrganizationSkeletonProps) {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3, ease: 'easeOut' }}
					className="h-full flex flex-col p-8 overflow-auto"
				>
					{/* Header skeleton */}
					<div className="mb-8 flex items-start justify-between">
						<div>
							<Skeleton variant="text" width={60} className="mb-2" />
							<div className="flex items-center gap-2">
								<Skeleton variant="text" width={180} height={28} />
								<Skeleton variant="rectangular" width={80} height={22} className="rounded-full" />
							</div>
							<Skeleton variant="text" width={240} className="mt-2" />
						</div>
						<div className="flex items-center gap-3">
							<Skeleton variant="rectangular" width={130} height={32} className="rounded-md" />
							<Skeleton variant="rectangular" width={110} height={32} className="rounded-md" />
							<Skeleton variant="rectangular" width={80} height={32} className="rounded-md" />
						</div>
					</div>

					{/* Primary stats grid skeleton */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
						{Array.from({ length: 4 }).map((_, i) => (
							<StatSkeleton key={`primary-${i}`} />
						))}
					</div>

					{/* Secondary stats grid skeleton */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
						{Array.from({ length: 4 }).map((_, i) => (
							<StatSkeleton key={`secondary-${i}`} />
						))}
					</div>

					{/* Content grid skeleton */}
					<div className="grid lg:grid-cols-2 gap-8 flex-1">
						{/* Contributors table skeleton */}
						<Card className="flex flex-col">
							<Card.Header>
								<div className="flex items-center justify-between">
									<Skeleton variant="text" width={200} height={20} />
									<Skeleton variant="circular" width={16} height={16} />
								</div>
							</Card.Header>
							<Card.Content className="flex-1 p-0">
								<TableSkeleton rows={5} columns={3} />
							</Card.Content>
						</Card>

						{/* Teams table skeleton */}
						<Card className="flex flex-col">
							<Card.Header>
								<div className="flex items-center justify-between">
									<Skeleton variant="text" width={80} height={20} />
									<Skeleton variant="circular" width={16} height={16} />
								</div>
							</Card.Header>
							<Card.Content className="flex-1 p-0">
								<TableSkeleton rows={5} columns={3} />
							</Card.Content>
						</Card>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

function StatSkeleton() {
	return (
		<div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--card)]">
			<Skeleton variant="text" width={80} height={32} className="mb-2" />
			<Skeleton variant="text" width={100} height={14} className="mb-1" />
			<Skeleton variant="text" width={120} height={12} />
		</div>
	)
}

interface TableSkeletonProps {
	rows: number
	columns: number
}

function TableSkeleton({ rows, columns }: TableSkeletonProps) {
	return (
		<div className="w-full">
			{/* Header */}
			<div className="flex items-center px-4 py-3 border-b border-[var(--border)]">
				{Array.from({ length: columns }).map((_, i) => (
					<div key={`header-${i}`} className={i === 0 ? 'flex-1' : 'w-20 text-right'}>
						<Skeleton
							variant="text"
							width={i === 0 ? 60 : 40}
							height={12}
							className={i !== 0 ? 'ml-auto' : ''}
						/>
					</div>
				))}
			</div>
			{/* Rows */}
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<div
					key={`row-${rowIndex}`}
					className="flex items-center px-4 py-3 border-b border-[var(--border)] last:border-b-0"
				>
					{Array.from({ length: columns }).map((_, colIndex) => (
						<div
							key={`cell-${rowIndex}-${colIndex}`}
							className={colIndex === 0 ? 'flex-1' : 'w-20 text-right'}
						>
							<Skeleton
								variant="text"
								width={colIndex === 0 ? 100 + Math.random() * 40 : 30 + Math.random() * 20}
								height={14}
								className={colIndex !== 0 ? 'ml-auto' : ''}
							/>
						</div>
					))}
				</div>
			))}
		</div>
	)
}
