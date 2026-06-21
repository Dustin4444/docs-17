// biome-ignore-all lint/a11y/noSvgWithoutTitle: The loading SVG is decorative and paired with visible chart context.

'use client'

import { scaleLinear } from '../_lib/chart'
import useMeasure from './useMeasure'

export const TPS_CHART_PAD = { l: 48, r: 110, t: 20, b: 28 }
export const TPS_CHART_DEFAULT_DOMAIN = [9500, 25_200] as [number, number]
export const TPS_CHART_DEFAULT_TICKS = [10_000, 15_000, 20_000, 25_000]

export function TpsChartGrid({
  height,
  showLabels = true,
  width,
  yDomain = TPS_CHART_DEFAULT_DOMAIN,
  yTicks = TPS_CHART_DEFAULT_TICKS,
}: {
  height: number
  showLabels?: boolean
  width: number
  yDomain?: [number, number]
  yTicks?: number[]
}) {
  const yAt = scaleLinear(yDomain, [height - TPS_CHART_PAD.b, TPS_CHART_PAD.t])

  return (
    <>
      {yTicks.map((t) => (
        <g key={t}>
          <line
            x1={TPS_CHART_PAD.l}
            x2={width - TPS_CHART_PAD.r}
            y1={yAt(t)}
            y2={yAt(t)}
            stroke="var(--line)"
          />
          {showLabels ? (
            <text
              x={TPS_CHART_PAD.l - 10}
              y={yAt(t) + 4}
              textAnchor="end"
              className="fill-white/35 font-mono text-[11px]"
            >
              {Math.round(t / 1000)}K
            </text>
          ) : null}
        </g>
      ))}
    </>
  )
}

export default function TpsTrendChartFrame({
  height = 360,
  showLabels = false,
}: {
  height?: number
  showLabels?: boolean
}) {
  const { ref, width } = useMeasure<HTMLDivElement>()

  return (
    <div ref={ref} className="relative w-full" style={{ height }} aria-hidden>
      {width > 0 ? (
        <svg width={width} height={height} className="block">
          <title>Benchmark chart frame</title>
          <TpsChartGrid height={height} showLabels={showLabels} width={width} />
        </svg>
      ) : null}
    </div>
  )
}
