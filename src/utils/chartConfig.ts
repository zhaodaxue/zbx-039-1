import type {
  LineProps,
  XAxisProps,
  YAxisProps,
  CartesianGridProps,
  TooltipProps,
  LegendProps,
} from 'recharts'

export interface TemperatureDataPoint {
  minute: number
  temperature: number
}

export function transformSamplesToChartData(samples: number[]): TemperatureDataPoint[] {
  return samples.map((temp, index) => ({
    minute: index,
    temperature: temp,
  }))
}

export const responsiveContainerProps = {
  width: '100%' as const,
  height: 400,
}

export const lineChartProps = {
  margin: { top: 20, right: 30, left: 20, bottom: 20 },
}

export const lineProps: Omit<LineProps, 'dataKey'> = {
  type: 'monotone',
  stroke: '#d97706',
  strokeWidth: 3,
  dot: { fill: '#d97706', r: 4 },
  activeDot: { r: 6, fill: '#92400e' },
}

export const xAxisProps: XAxisProps = {
  dataKey: 'minute',
  label: { value: '时间 (分钟)', position: 'insideBottom', offset: -10, style: { fill: '#6b7280' } },
  tick: { fill: '#6b7280' },
  stroke: '#d1d5db',
}

export const yAxisProps: YAxisProps = {
  domain: ['auto', 'auto'],
  label: { value: '温度 (°C)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } },
  tick: { fill: '#6b7280' },
  stroke: '#d1d5db',
}

export const cartesianGridProps: CartesianGridProps = {
  strokeDasharray: '5 5',
  stroke: '#e5e7eb',
}

export const tooltipProps: TooltipProps<number, string> = {
  contentStyle: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  formatter: (value: number) => [`${value}°C`, '温度'],
  labelFormatter: (label: number) => `第 ${label} 分钟`,
}

export const legendProps: LegendProps = {
  wrapperStyle: {
    paddingTop: '10px',
  },
}
