import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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
import { Coffee, ArrowLeft, Calendar, Thermometer, Clock } from 'lucide-react'
import type { Batch } from '../../shared/types'
import {
  transformSamplesToChartData,
  responsiveContainerProps,
  lineChartProps,
  lineProps,
  xAxisProps,
  yAxisProps,
  cartesianGridProps,
  tooltipProps,
  legendProps,
} from '@/utils/chartConfig'

export default function BatchDetail() {
  const { id } = useParams<{ id: string }>()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchBatch(id)
    }
  }, [id])

  async function fetchBatch(batchId: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/batches/${batchId}`)
      const data = await res.json()
      if (data.success) {
        setBatch(data.data)
      } else {
        setError(data.error || '加载失败')
      }
    } catch (err) {
      console.error('获取批次详情失败:', err)
      setError('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">加载中...</div>
      </div>
    )
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <header className="bg-gradient-to-r from-amber-800 to-orange-700 text-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-amber-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回列表
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Coffee className="w-16 h-16 mx-auto text-amber-300 mb-4" />
            <p className="text-gray-500 text-lg">{error || '批次不存在'}</p>
            <Link
              to="/"
              className="inline-block mt-4 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              返回列表
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const chartData = transformSamplesToChartData(batch.samples)
  const firstCrackMin = (batch.firstCrackSec / 60).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <header className="bg-gradient-to-r from-amber-800 to-orange-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-amber-100 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </Link>
          <div className="flex items-center gap-3">
            <Coffee className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">{batch.beanType}</h1>
              <p className="text-amber-100">批次详情</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-600" />
            元数据
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-700 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                烘焙日期
              </div>
              <p className="text-xl font-bold text-gray-800">{batch.roastDate}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-orange-700 text-sm mb-1">
                <Thermometer className="w-4 h-4" />
                入豆温度
              </div>
              <p className="text-xl font-bold text-gray-800">{batch.chargeTemp}°C</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 text-sm mb-1">
                <Thermometer className="w-4 h-4" />
                出豆温度
              </div>
              <p className="text-xl font-bold text-gray-800">{batch.dischargeTemp}°C</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-700 text-sm mb-1">
                <Clock className="w-4 h-4" />
                一爆时间
              </div>
              <p className="text-xl font-bold text-gray-800">
                {batch.firstCrackSec}s ({firstCrackMin}min)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-amber-600" />
            温度采样曲线
          </h2>
          <ResponsiveContainer {...responsiveContainerProps}>
            <LineChart data={chartData} {...lineChartProps}>
              <CartesianGrid {...cartesianGridProps} />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <Tooltip {...tooltipProps} />
              <Legend {...legendProps} />
              <Line dataKey="temperature" name="温度" {...lineProps} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
            {batch.samples.map((temp, idx) => (
              <div key={idx} className="bg-amber-50 rounded-lg p-2 text-center">
                <p className="text-xs text-amber-600">{idx}min</p>
                <p className="text-sm font-bold text-gray-800">{temp}°C</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-bold shadow-md"
          >
            继续记录下一批次
          </Link>
        </div>
      </main>
    </div>
  )
}
