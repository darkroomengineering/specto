interface LogoProps {
	size?: number
	className?: string
}

export function Logo({ size = 32, className }: LogoProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 1024 1024"
			className={className}
		>
			<defs>
				<linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style={{ stopColor: '#1a1a1a' }} />
					<stop offset="100%" style={{ stopColor: '#0a0a0a' }} />
				</linearGradient>
				<linearGradient id="logo-accent" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style={{ stopColor: '#ff3b3b' }} />
					<stop offset="100%" style={{ stopColor: '#e30613' }} />
				</linearGradient>
			</defs>
			<rect
				x="169.984"
				y="169.984"
				width="684.032"
				height="684.032"
				rx="150.487"
				ry="150.487"
				fill="url(#logo-bg)"
			/>
			<rect
				x="169.984"
				y="169.984"
				width="684.032"
				height="684.032"
				rx="150.487"
				ry="150.487"
				fill="none"
				stroke="rgba(255,255,255,0.1)"
				strokeWidth="2.048"
			/>
			<path
				d="M 579.035136 344.4121600000001 C 440.17664 344.4121600000001 392.29440000000005 392.29440000000005 392.29440000000005 452.1472 C 392.29440000000005 512 452.1472 535.94112 512 547.9116799999999 C 571.8528 559.88224 631.7056 583.82336 631.7056 643.67616 C 631.7056 703.52896 583.82336 751.4111999999999 444.96486400000003 751.4111999999999 L 444.96486400000003 691.5583999999999 C 547.9116799999999 691.5583999999999 571.8528 667.6172799999999 571.8528 636.4938239999999 C 571.8528 602.9762559999999 523.97056 583.82336 476.08832 564.670464 C 416.23552 540.729344 332.44160000000005 500.02944 332.44160000000005 428.20608000000004 C 332.44160000000005 356.38272000000006 404.26496000000003 284.5593600000001 579.035136 284.5593600000001 Z"
				fill="url(#logo-accent)"
			/>
		</svg>
	)
}
