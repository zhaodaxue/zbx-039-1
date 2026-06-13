import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  Coffee, Plus, Search, Calendar, Thermometer, Clock, AlertTriangle, RefreshCw,
  Check, GitCompare, X, Trash2
} from 'lucide-react'
import type { Batch } from '../../shared/types'
import {
  getStoredSelection, setStoredSelection, toggleSelection, COMPARE_MAX
} from '@/utils/compareSelection'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [batches, setBatches] = useState<Batch[]>([])
  const [filter, setFilter] = useState(searchParams.get('beanType') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentBeanType = useMemo(() => searchParams.get('beanType') || '', [searchParams])
  const [selectedIds, setSelectedIds] = useState<string[]>(() => getStoredSelection(currentBeanType))
  const [compareMode, setCompareMode] = useState(false)

  useEffect(() => {
    setSelectedIds(getStoredSelection(currentBeanType))
  }, [currentBeanType])

  useEffect(() => {
    setStoredSelection(currentBeanType, selectedIds)
  }, [currentBeanType, selectedIds])

  const fetchBatches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const beanType = searchParams.get('beanType')
      const url = beanType ? `/api/batches?beanType=${encodeURIComponent(beanType)}` : '/api/batches'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setBatches(data.data)
      } else {
        setError(data.error || '加载失败')
      }
    } catch (err) {
      console.error('获取批次列表失败:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

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

  function handleToggleSelect(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const { next, changed } = toggleSelection(selectedIds, id)
    if (!changed && selectedIds.length >= COMPARE_MAX) {
      return
    }
    setSelectedIds(next)
  }

  function handleExitCompare() {
    setCompareMode(false)
    setSelectedIds([])
  }

  function handleClearSelection(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setSelectedIds([])
  }

  function handleGoCompare() {
    if (selectedIds.length === 0) return
    navigate(`/compare?ids=${selectedIds.join(',')}`)
  }

  const canSelect = compareMode
  const batchCount = selectedIds.length
  const atMax = batchCount >= COMPARE_MAX

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pb-28">
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

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setCompareMode(!compareMode)
                if (compareMode) setSelectedIds([])
              }}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium shadow-sm w-full sm:w-auto justify-center ${
                compareMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              {compareMode ? (
                <>
                  <X className="w-5 h-5" />
                  退出对比
                </>
              ) : (
                <>
                  <GitCompare className="w-5 h-5" />
                  对比模式
                </>
              )}
            </button>
            <Link
              to="/create"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-medium shadow-md w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              新增烘焙批次
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">加载中...</div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <AlertTriangle className="w-16 h-16 mx-auto text-red-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">加载失败</p>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button
              onClick={fetchBatches}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              重新加载
            </button>
          </div>
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
            {batches.map((batch) => {
              const isSelected = selectedIds.includes(batch.id)
              return (
                <div
                  key={batch.id}
                  className={`relative block rounded-2xl shadow-sm border overflow-hidden transition-all ${
                    isSelected
                      ? 'ring-4 ring-amber-400 border-amber-300 bg-amber-50'
                      : 'border-amber-100 hover:border-amber-300 bg-white hover:shadow-lg'
                  }`}
                >
                  <Link
                    to={canSelect ? undefined : `/batch/${batch.id}`}
                    onClick={(e) => {
                      if (canSelect) {
                        handleToggleSelect(batch.id, e)
                      }
                    }}
                    className="block"
                  >
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-4 border-b border-amber-50">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-amber-900">
                          {batch.beanType}
                        </h3>
                        {canSelect && (
                          <div
                            onClick={(e) => handleToggleSelect(batch.id, e)}
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-amber-600 border-amber-600'
                                : 'bg-white border-gray-300 hover:border-amber-500'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        )}
                      </div>
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
                  {canSelect && isSelected && (
                    <div
                      onClick={(e) => handleToggleSelect(batch.id, e)}
                      className="absolute inset-0 cursor-pointer"
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {canSelect && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.08)">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">已选</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    batchCount > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {batchCount} / {COMPARE_MAX}
                </span>
                <span className="text-gray-500 text-sm">批</span>
              </div>
              {batchCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-gray-500 hover:text-red-600 text-sm flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              )}
              {atMax && (
                <span className="text-amber-600 text-sm">已达最大数量</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExitCompare}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                disabled={batchCount === 0}
                onClick={handleGoCompare}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  batchCount > 0
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <GitCompare className="w-5 h-5" />
                进入对比
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
