import type { Batch } from '../../shared/types'

export type MetadataFieldKey =
  | 'beanType'
  | 'roastDate'
  | 'chargeTemp'
  | 'firstCrackSec'
  | 'dischargeTemp'

export interface MetadataField {
  key: MetadataFieldKey
  label: string
  unit?: string
}

export const METADATA_FIELDS: MetadataField[] = [
  { key: 'beanType', label: '豆种' },
  { key: 'roastDate', label: '烘焙日期' },
  { key: 'chargeTemp', label: '入豆温', unit: '°C' },
  { key: 'firstCrackSec', label: '一爆秒数', unit: 's' },
  { key: 'dischargeTemp', label: '出豆温', unit: '°C' },
]

export function formatValue(
  field: MetadataField,
  batch: Batch | null
): string {
  if (!batch) return '—'
  const v = batch[field.key]
  if (v === undefined || v === null) return '—'
  if (field.unit) return `${v}${field.unit}`
  return String(v)
}

export function hasBeanTypeMixed(batches: Batch[]): boolean {
  if (batches.length <= 1) return false
  const first = batches[0].beanType
  return batches.some((b) => b.beanType !== first)
}

export function computeDiffMarks(
  batches: Batch[]
): Record<MetadataFieldKey, boolean[]> {
  const marks: Record<MetadataFieldKey, boolean[]> = {
    beanType: [],
    roastDate: [],
    chargeTemp: [],
    firstCrackSec: [],
    dischargeTemp: [],
  }
  const n = batches.length
  for (const field of METADATA_FIELDS) {
    const arr: boolean[] = []
    for (let i = 0; i < n; i++) {
      if (n <= 1) {
        arr.push(false)
        continue
      }
      const prev = i === 0 ? batches[1][field.key] : batches[i - 1][field.key]
      const curr = batches[i][field.key]
      arr.push(curr !== prev)
    }
    marks[field.key] = arr
  }
  return marks
}
