import { Checkout } from '@polar-sh/nextjs'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { polarServer } from '@/lib/polar'

let handler: ReturnType<typeof Checkout> | undefined

export async function GET(request: NextRequest) {
	const accessToken = process.env.POLAR_ACCESS_TOKEN
	const appUrl = process.env.NEXT_PUBLIC_APP_URL
	if (!accessToken || !appUrl) {
		console.error('Checkout requires POLAR_ACCESS_TOKEN and NEXT_PUBLIC_APP_URL')
		return NextResponse.json({ error: 'Checkout is not configured' }, { status: 503 })
	}

	handler ??= Checkout({ accessToken, successUrl: `${appUrl}/success`, server: polarServer })
	return handler(request)
}
