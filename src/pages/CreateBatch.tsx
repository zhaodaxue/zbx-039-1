import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Coffee, ArrowLeft, Thermometer, Clock, Calendar, Bean } from 'lucide-react'
import { validateBatchForm, hasErrors, type BatchFormData, type ValidationErrors } from '@/utils/validation'

export default function CreateBatch() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<BatchFormData>({
    beanType: '',
    roastDate: new Date().toISOString().split('T')[0],
    chargeTemp: '',
    firstCrackSec: '',
    dischargeTemp: '',
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const validationErrors = validateBatchForm(formData)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beanType: formData.beanType.trim(),
          roastDate: formData.roastDate,
          chargeTemp: parseFloat(formData.chargeTemp),
          firstCrackSec: parseFloat(formData.firstCrackSec),
          dischargeTemp: parseFloat(formData.dischargeTemp),
        }),
      })

      const data = await res.json()
      if (data.success) {
        navigate(`/batch/${data.data.id}`)
      } else {
        alert(data.error || '提交失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <header className="bg-gradient-to-r from-amber-800 to-orange-700 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-amber-100 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </Link>
          <div className="flex items-center gap-3">
            <Coffee className="w-8 h-8" />
            <h1 className="text-2xl font-bold">新增烘焙批次</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Bean className="w-4 h-4 text-amber-600" />
              豆种名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="beanType"
              value={formData.beanType}
              onChange={handleChange}
              placeholder="例如：埃塞俄比亚 耶加雪菲"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                errors.beanType ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.beanType && <p className="mt-1 text-sm text-red-500">{errors.beanType}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              烘焙日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="roastDate"
              value={formData.roastDate}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                errors.roastDate ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.roastDate && <p className="mt-1 text-sm text-red-500">{errors.roastDate}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 text-orange-600" />
                入豆温度 (°C) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="chargeTemp"
                value={formData.chargeTemp}
                onChange={handleChange}
                placeholder="例如：200"
                step="0.1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                  errors.chargeTemp ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.chargeTemp && <p className="mt-1 text-sm text-red-500">{errors.chargeTemp}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 text-red-600" />
                出豆温度 (°C) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="dischargeTemp"
                value={formData.dischargeTemp}
                onChange={handleChange}
                placeholder="例如：220"
                step="0.1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                  errors.dischargeTemp ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.dischargeTemp && (
                <p className="mt-1 text-sm text-red-500">{errors.dischargeTemp}</p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              一爆秒数 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="firstCrackSec"
              value={formData.firstCrackSec}
              onChange={handleChange}
              placeholder="例如：480"
              step="1"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                errors.firstCrackSec ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.firstCrackSec && (
              <p className="mt-1 text-sm text-red-500">{errors.firstCrackSec}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-bold text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '提交中...' : '创建批次'}
          </button>
        </form>
      </main>
    </div>
  )
}
