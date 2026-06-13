import type {
  LineProps,
  XAxisProps,
  YAxisProps,
  CartesianGridProps,
  TooltipProps,
  LegendProps,
} from 'recharts'
import type { Batch } from '../../shared/types'
import { transformSamplesToChartData, type TemperatureDataPoint } from './chartConfig'

export const CURVE_COLORS = [
  '#d97706',
  '#7c3aed',
  '#0891b2',
  '#059669',
]

export interface CompareChartPoint {
  minute: number
  [key: string]: number | null | undefined
}

export function transformMultiSamplesToChartData(
  batches: Batch[]
): CompareChartPoint[] {
  if (batches.length === 0) return []
  const len = batches[0].samples.length
  const result: CompareChartPoint[] = []
  for (let i = 0; i < len; i++) {
    const point: CompareChartPoint = { minute: i }
    batches.forEach((b) => {
      point[b.id] = b.samples[i] ?? null
    })
    result.push(point)
  }
  return result
}

export interface CompareLineConfig {
  batchId: string
  label: string
  color: string
  isNewest: boolean
  samples: number[]
}

export function buildLineConfigs(
  batches: Batch[],
  newestBatchId: string | null
): CompareLineConfig[] {
  return batches.map((batch, idx) => ({
    batchId: batch.id,
    label: `${batch.beanType} · ${batch.roastDate}`,
    color: CURVE_COLORS[idx % CURVE_COLORS.length],
    isNewest: batch.id === newestBatchId,
    samples: batch.samples,
  }))
}

export function findNewestBatchId(batches: Batch[]): string | null {
  if (batches.length === 0) return null
  let newest: Batch | null = null
  for (const b of batches) {
    if (!newest || b.roastDate > newest.roastDate) {
      newest = b
    }
  }
  return newest.id
}

export function buildLineProps(
  cfg: CompareLineConfig
): Omit<LineProps, 'dataKey'> {
  return {
    type: 'monotone',
    stroke: cfg.color,
    strokeWidth: cfg.isNewest ? 1 : 3,
    dot: { fill: cfg.color, r: cfg.isNewest ? 3 : 4 },
    activeDot: { r: 6, fill: cfg.color },
  }
}

export const compareResponsiveContainerProps = {
  width: '100%' as const,
  height: 480,
}

export const compareLineChartProps = {
  margin: { top: 20, right: 30, left: 20, bottom: 20 },
}

export const compareXAxisProps: XAxisProps = {
  dataKey: 'minute',
  label: { value: '时间 (分钟)', position: 'insideBottom', offset: -10, style: { fill: '#6b7280' } },
  tick: { fill: '#6b7280' },
  stroke: '#d1d5db',
}

export const compareYAxisProps: YAxisProps = {
  domain: ['auto', 'auto'],
  label: { value: '温度 (°C)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } },
  tick: { fill: '#6b7280' },
  stroke: '#d1d5db',
}

export const compareCartesianGridProps: CartesianGridProps = {
  strokeDasharray: '5 5',
  stroke: '#e5e7eb',
}

export const compareTooltipProps: TooltipProps<number, string> = {
  contentStyle: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  formatter: (value: number, name: string) => [`${value}°C`, name],
  labelFormatter: (label: number) => `第 ${label} 分钟`,
}

export const compareLegendProps: LegendProps = {
  wrapperStyle: {
    paddingTop: '10px',
  },
}

export { transformSamplesToChartData }
export type { TemperatureDataPoint }
