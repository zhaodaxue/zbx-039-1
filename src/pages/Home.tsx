import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Coffee, Plus, Search, Calendar, Thermometer, Clock } from 'lucide-react'
import type { Batch } from '../../shared/types'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [batches, setBatches] = useState<Batch[]>([])
  const [filter, setFilter] = useState(searchParams.get('beanType') || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatches()
  }, [searchParams])

  async function fetchBatches() {
    setLoading(true)
    try {
      const beanType = searchParams.get('beanType')
      const url = beanType ? `/api/batches?beanType=${encodeURIComponent(beanType)}` : '/api/batches'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setBatches(data.data)
      }
    } catch (error) {
      console.error('获取批次列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (filter.trim()) {
      setSearchParams({ beanType: filter.trim() })
    } else {
      setSearchParams({})
    }
  }

  function clearFilter() {
    setFilter('')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <header className="bg-gradient-to-r from-amber-800 to-orange-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Coffee className="w-10 h-10" />
            <h1 className="text-3xl font-bold">手冲咖啡烘焙批次追溯</h1>
          </div>
          <p className="text-amber-100">记录每一批豆子的烘焙历程</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="按豆种筛选..."
                className="w-full sm:w-72 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium shadow-sm"
            >
              筛选
            </button>
            {filter && (
              <button
                type="button"
                onClick={clearFilter}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                清除
              </button>
            )}
          </form>

          <Link
            to="/create"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-medium shadow-md w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            新增烘焙批次
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">加载中...</div>
        ) : batches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Coffee className="w-16 h-16 mx-auto text-amber-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">暂无烘焙批次记录</p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              创建第一批记录
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <Link
                key={batch.id}
                to={`/batch/${batch.id}`}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-amber-100 hover:border-amber-300 overflow-hidden group"
              >
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-4 border-b border-amber-50">
                  <h3 className="text-xl font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                    {batch.beanType}
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>{batch.roastDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Thermometer className="w-4 h-4 text-orange-600" />
                    <span>入豆 {batch.chargeTemp}°C → 出豆 {batch.dischargeTemp}°C</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span>一爆: {batch.firstCrackSec} 秒</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
