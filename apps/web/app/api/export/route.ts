import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { corsHeaders, preflight } from '@/lib/cors'
import { validateLicenseKey } from '@/lib/polar'

const count = z.number().finite()

const exportSchema = z.object({
	licenseKey: z.string().min(1),
	format: z.enum(['csv', 'json']),
	data: z.object({
		organization: z.string(),
		metrics: z.object({
			commits: count,
			pullRequests: count,
			issues: count,
			contributors: count,
			repositories: count,
			stars: count.optional(),
		}),
		period: z.string(),
		generatedAt: z.string(),
	}),
})

type ExportData = z.infer<typeof exportSchema>['data']

function csvCell(value: string | number): string {
	const text = String(value)
	return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function generateCSV({ organization, period, metrics, generatedAt }: ExportData): string {
	const rows: [string, string | number][] = [
		['Organization', organization],
		['Period', period],
		['Commits', metrics.commits],
		['Pull Requests', metrics.pullRequests],
		['Issues', metrics.issues],
		['Contributors', metrics.contributors],
		['Repositories', metrics.repositories],
		...(metrics.stars === undefined ? [] : [['Stars', metrics.stars] as [string, number]]),
		['Generated At', generatedAt],
	]
	return ['Metric,Value', ...rows.map(([k, v]) => `${csvCell(k)},${csvCell(v)}`)].join('\n')
}

export function OPTIONS(request: NextRequest) {
	return preflight(request, 'POST')
}

export async function POST(request: NextRequest) {
	const headers = corsHeaders(request, 'POST')

	const parsed = exportSchema.safeParse(await request.json().catch(() => null))
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers })
	}
	const { licenseKey, format, data } = parsed.data

	const license = await validateLicenseKey(licenseKey)
	if (!license.valid) {
		return NextResponse.json(
			{ error: 'Valid Pro license required for export' },
			{ status: 403, headers }
		)
	}

	const filename = `specto-${data.organization.replace(/[^\w.-]/g, '_')}-${Date.now()}.${format}`
	const disposition = `attachment; filename="${filename}"`

	if (format === 'csv') {
		return new NextResponse(generateCSV(data), {
			headers: {
				...headers,
				'Content-Type': 'text/csv',
				'Content-Disposition': disposition,
			},
		})
	}
	return NextResponse.json(data, { headers: { ...headers, 'Content-Disposition': disposition } })
}
