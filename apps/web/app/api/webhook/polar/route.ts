import { Webhooks } from '@polar-sh/nextjs'
import { NextResponse, type NextRequest } from 'next/server'
import {
	findOrCreateUserByEmail,
	findUserByPolarCustomerId,
	updateUserProStatus,
	findSubscriptionById,
	upsertSubscription,
	updateSubscriptionStatus,
} from '@/lib/db/queries'

const webhookSecret = process.env.POLAR_WEBHOOK_SECRET

const webhookHandler = Webhooks({
	webhookSecret: webhookSecret ?? '',

	onOrderPaid: async (payload) => {
		const { customer, product } = payload.data

		if (!customer?.email) {
			console.error('Order paid but no customer email:', payload.data.id)
			return
		}

		// Find or create user and link Polar customer ID
		const user = await findOrCreateUserByEmail(customer.email, customer.id)

		console.log('Order paid:', {
			orderId: payload.data.id,
			userId: user.id,
			hasEmail: !!customer.email,
			product: product?.name,
		})
	},

	onSubscriptionCreated: async (payload) => {
		const { id, customer, status, product } = payload.data

		if (!customer?.id) {
			console.error('Subscription created but no customer ID:', id)
			return
		}

		// Find user by Polar customer ID
		let user = await findUserByPolarCustomerId(customer.id)

		// If user not found by customer ID, try email (fallback for race conditions)
		if (!user && customer.email) {
			user = await findOrCreateUserByEmail(customer.email, customer.id)
		}

		if (!user) {
			console.error('No user found for subscription:', id, customer.id)
			return
		}

		// Determine plan from product name
		const plan = determinePlan(product?.name)

		// Parse period dates from Polar payload (type varies by SDK version)
		const rawData = payload.data as unknown as Record<string, unknown>
		const periodStartRaw = rawData.currentPeriodStart ?? rawData.current_period_start
		const periodEndRaw = rawData.currentPeriodEnd ?? rawData.current_period_end
		const periodStart = periodStartRaw ? new Date(periodStartRaw as string) : null
		const periodEnd = periodEndRaw ? new Date(periodEndRaw as string) : null

		// Create or update subscription
		await upsertSubscription({
			id,
			userId: user.id,
			status: status ?? 'active',
			plan,
			currentPeriodStart: periodStart,
			currentPeriodEnd: periodEnd,
			canceledAt: null,
		})

		// Grant Pro access
		await updateUserProStatus(user.id, true)

		console.log('Subscription created:', {
			subscriptionId: id,
			userId: user.id,
			status,
			plan,
		})
	},

	onSubscriptionUpdated: async (payload) => {
		const { id, status } = payload.data

		// Find existing subscription
		const subscription = await findSubscriptionById(id)

		if (!subscription) {
			console.error('Subscription not found for update:', id)
			return
		}

		// Parse period dates from Polar payload (type varies by SDK version)
		const rawData = payload.data as unknown as Record<string, unknown>
		const periodStartRaw = rawData.currentPeriodStart ?? rawData.current_period_start
		const periodEndRaw = rawData.currentPeriodEnd ?? rawData.current_period_end
		const periodStart = periodStartRaw ? new Date(periodStartRaw as string) : null
		const periodEnd = periodEndRaw ? new Date(periodEndRaw as string) : null

		// Update subscription
		await upsertSubscription({
			...subscription,
			status: status ?? subscription.status,
			currentPeriodStart: periodStart,
			currentPeriodEnd: periodEnd,
		})

		// Update user Pro status based on subscription status
		const isPro = status === 'active'
		await updateUserProStatus(subscription.userId, isPro)

		console.log('Subscription updated:', {
			subscriptionId: id,
			userId: subscription.userId,
			status,
			isPro,
		})
	},

	onSubscriptionCanceled: async (payload) => {
		const { id } = payload.data

		// Find existing subscription
		const subscription = await findSubscriptionById(id)

		if (!subscription) {
			console.error('Subscription not found for cancellation:', id)
			return
		}

		// Update subscription status
		await updateSubscriptionStatus(id, 'canceled', new Date())

		// Revoke Pro access
		await updateUserProStatus(subscription.userId, false)

		console.log('Subscription canceled:', {
			subscriptionId: id,
			userId: subscription.userId,
		})
	},
})

// Wrap handler with runtime env validation
export async function POST(request: NextRequest): Promise<NextResponse> {
	if (!webhookSecret || webhookSecret.length < 32) {
		console.error('POLAR_WEBHOOK_SECRET is missing or invalid')
		return NextResponse.json(
			{ error: 'Webhook not configured' },
			{ status: 503 }
		)
	}
	return webhookHandler(request)
}

function determinePlan(productName?: string): string {
	if (!productName) return 'pro_monthly'

	const name = productName.toLowerCase()
	if (name.includes('yearly') || name.includes('annual')) {
		return 'pro_yearly'
	}
	return 'pro_monthly'
}
