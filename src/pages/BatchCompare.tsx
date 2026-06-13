import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { LegendProps } from 'recharts'
import {
  Coffee, ArrowLeft, AlertTriangle, Info, GitCompare, X
} from 'lucide-react'
import type { Batch } from '../../shared/types'
import {
  transformMultiSamplesToChartData,
  buildLineConfigs,
  findNewestBatchId,
  buildLineProps,
  compareResponsiveContainerProps,
  compareLineChartProps,
  compareXAxisProps,
  compareYAxisProps,
  compareCartesianGridProps,
  compareTooltipProps,
  compareLegendProps,
  type CompareChartPoint,
  type CompareLineConfig,
  CURVE_COLORS,
} from '@/utils/compareChartConfig'
import {
  METADATA_FIELDS,
  formatValue,
  hasBeanTypeMixed,
  computeDiffMarks,
  type MetadataField,
  type MetadataFieldKey,
} from '@/utils/metadataDiff'

interface LoadResult {
  batch: Batch | null
  error: string | null
}

interface LegendEntry {
  value?: string
  dataKey?: string
  color?: string
  type?: string
  payload?: Record<string, unknown>
}

type LegendOnClick = NonNullable<LegendProps['onClick']>
type LegendFormatter = NonNullable<LegendProps['formatter']>

export default function BatchCompare() {
  const [searchParams] = useSearchParams()
  const idsParam = searchParams.get('ids') || ''

  const ids = useMemo(() => {
    return idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
  }, [idsParam])

  const [results, setResults] = useState<Record<string, LoadResult>>({})
  const [loading, setLoading] = useState(true)
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function loadAll() {
      setLoading(true)
      const map: Record<string, LoadResult> = {}
      await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`/api/batches/${id}`)
            const data = await res.json()
            if (data.success) {
              map[id] = { batch: data.data, error: null }
            } else {
              map[id] = { batch: null, error: data.error || '批次不存在' }
            }
          } catch {
            map[id] = { batch: null, error: '加载失败' }
          }
        })
      )
      if (!cancelled) {
        setResults(map)
        setLoading(false)
      }
    }
    loadAll()
    return () => {
      cancelled = true
    }
  }, [idsParam, ids])

  const validBatches = useMemo(() => {
    return ids
      .map((id) => results[id]?.batch)
      .filter((b): b is Batch => b !== null)
      .sort((a, b) => (a.roastDate < b.roastDate ? -1 : a.roastDate > b.roastDate ? 1 : 0))
  }, [ids, results])

  const missingIds = useMemo(() => {
    return ids.filter((id) => {
      const r = results[id]
      return r && !r.batch
    })
  }, [ids, results])

  const newestId = useMemo(() => findNewestBatchId(validBatches), [validBatches])
  const lineConfigs = useMemo(
    () => buildLineConfigs(validBatches, newestId),
    [validBatches, newestId]
  )
  const chartData: CompareChartPoint[] = useMemo(
    () => transformMultiSamplesToChartData(validBatches),
    [validBatches]
  )
  const isBeanMixed = useMemo(() => hasBeanTypeMixed(validBatches), [validBatches])
  const diffMarks = useMemo(() => computeDiffMarks(validBatches), [validBatches])

  const handleLegendClick: LegendOnClick = (o) => {
    const batchId = (o as LegendEntry).dataKey || ''
    if (!batchId) return
    setHiddenLines((prev) => {
      const next = new Set(prev)
      if (next.has(batchId)) {
        next.delete(batchId)
      } else {
        next.add(batchId)
      }
      return next
    })
  }

  function getColorForBatchId(batchId: string): string {
    const cfg = lineConfigs.find((c) => c.batchId === batchId)
    return cfg?.color || '#9ca3af'
  }

  if (ids.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <header className="bg-gradient-to-r from-amber-800 to-orange-700 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Link to="/" className="inline-flex items-center gap-2 text-amber-100 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              返回列表
            </Link>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <GitCompare className="w-16 h-16 mx-auto text-amber-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">未选择对比批次</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
              去列表选择
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <header className="bg-gradient-to-r from-amber-800 to-orange-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-amber-100 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </Link>
          <div className="flex items-center gap-3">
            <GitCompare className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">批次对比</h1>
              <p className="text-amber-100">共 {validBatches.length} 个批次</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {missingIds.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-800 mb-1">以下批次加载失败：</p>
              <p className="text-red-700 text-sm">
                {missingIds.map((id, i) => {
                  const err = results[id]?.error || '未知错误'
                  return (
                    <span key={id} className="inline-flex items-center gap-1 mr-3 mb-1">
                      <code className="bg-red-100 px-2 py-0.5 rounded text-xs">{id}</code>
                      <span>（{err}）</span>
                      {i < missingIds.length - 1 && <span className="text-red-300">·</span>}
                    </span>
                  )
                })}
              </p>
            </div>
          </div>
        )}

        {isBeanMixed && validBatches.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-800 mb-0.5">豆种不一致</p>
              <p className="text-blue-700 text-sm">仅供温升形态参考，温度绝对值对比意义有限</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500 bg-white rounded-2xl shadow-sm">加载中...</div>
        ) : validBatches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Coffee className="w-16 h-16 mx-auto text-amber-300 mb-4" />
            <p className="text-gray-500 text-lg">没有可对比的有效批次</p>
            <Link to="/" className="inline-block mt-4 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
              返回列表
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-600" />
                  温度曲线对比
                </h2>
                {hiddenLines.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setHiddenLines(new Set())}
                    className="text-sm text-gray-500 hover:text-amber-700 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    显示全部曲线
                  </button>
                )}
              </div>
              <ResponsiveContainer {...compareResponsiveContainerProps}>
                <LineChart data={chartData} {...compareLineChartProps}>
                  <CartesianGrid {...compareCartesianGridProps} />
                  <XAxis {...compareXAxisProps} />
                  <YAxis {...compareYAxisProps} />
                  <Tooltip {...compareTooltipProps} />
                  <Legend
                    {...compareLegendProps}
                    onClick={handleLegendClick}
                    formatter={(function (value: string, entry: LegendEntry) {
                      const cfg = lineConfigs.find((c) => c.batchId === entry.dataKey)
                      const isHidden = hiddenLines.has(entry.dataKey || '')
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 cursor-pointer ${
                            isHidden ? 'line-through text-gray-400' : ''
                          }`}
                          style={{ color: isHidden ? undefined : entry.color }}
                        >
                          {cfg?.isNewest && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                              最新
                            </span>
                          )}
                          <span className="font-medium">{value}</span>
                        </span>
                      )
                    }) as LegendFormatter}
                  />
                  {lineConfigs.map((cfg: CompareLineConfig) => (
                    <Line
                      key={cfg.batchId}
                      dataKey={cfg.batchId}
                      name={cfg.label}
                      {...buildLineProps(cfg)}
                      hide={hiddenLines.has(cfg.batchId)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 text-xs text-gray-500 flex flex-wrap gap-x-6 gap-y-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-0.5 bg-gray-400 inline-block" style={{ height: '1px' }} />
                  <span>最细线 = 最新烘焙日期</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span>点击图例可显/隐曲线</span>
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-600" />
                元数据对比
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left px-4 py-3 bg-gray-50 font-bold text-gray-700 border-b border-gray-200 rounded-tl-xl sticky left-0 z-10">
                        字段
                      </th>
                      {validBatches.map((batch, idx) => (
                        <th
                          key={batch.id}
                          className="text-left px-4 py-3 border-b border-gray-200 min-w-[160px]"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: CURVE_COLORS[idx % CURVE_COLORS.length] }}
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800">{batch.beanType}</span>
                              <span className="text-xs text-gray-500">{batch.roastDate}</span>
                              {batch.id === newestId && (
                                <span className="text-[10px] mt-0.5 inline-block px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium w-fit">
                                  最新
                                </span>
                              )}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {METADATA_FIELDS.map((field: MetadataField, fIdx) => (
                      <tr
                        key={field.key}
                        className={fIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                      >
                        <td className="px-4 py-3 border-b border-gray-100 font-medium text-gray-700 sticky left-0 bg-inherit z-10">
                          {field.label}
                        </td>
                        {validBatches.map((batch, bIdx) => {
                          const isDiff = diffMarks[field.key as MetadataFieldKey][bIdx]
                          const bg = isDiff ? 'bg-yellow-100' : ''
                          return (
                            <td
                              key={batch.id}
                              className={`px-4 py-3 border-b border-gray-100 ${bg}`}
                            >
                              <span
                                className={`inline-block rounded px-2 py-0.5 ${
                                  isDiff ? 'font-bold text-amber-900' : 'text-gray-800'
                                }`}
                              >
                                {formatValue(field, batch)}
                              </span>
                              {isDiff && (
                                <span
                                  className="w-2 h-2 rounded-full ml-1 inline-block"
                                  style={{ backgroundColor: getColorForBatchId(batch.id) }}
                                  title={`${batch.beanType} 与相邻批次不同`}
                                />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span className="w-4 h-4 rounded bg-yellow-100 inline-block border border-yellow-200" />
                <span>黄色标记 = 与相邻批次数值不同</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
