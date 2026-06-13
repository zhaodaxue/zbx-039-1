import type { CreateBatchRequest } from '../../shared/types.js'

export interface ValidationErrors {
  beanType?: string
  roastDate?: string
  chargeTemp?: string
  firstCrackSec?: string
  dischargeTemp?: string
}

export function validateCreateBatch(data: CreateBatchRequest): ValidationErrors {
  const errors: ValidationErrors = {}

  if (typeof data.beanType !== 'string' || !data.beanType.trim()) {
    errors.beanType = '请输入豆种名称'
  } else if (data.beanType.trim().length < 2) {
    errors.beanType = '豆种名称至少 2 个字符'
  }

  if (typeof data.roastDate !== 'string' || !data.roastDate) {
    errors.roastDate = '请选择烘焙日期'
  } else if (isNaN(new Date(data.roastDate).getTime())) {
    errors.roastDate = '烘焙日期格式无效'
  }

  if (typeof data.chargeTemp !== 'number' || isNaN(data.chargeTemp)) {
    errors.chargeTemp = '请输入有效的入豆温度'
  } else if (data.chargeTemp < 100 || data.chargeTemp > 300) {
    errors.chargeTemp = '入豆温度应在 100-300°C 之间'
  }

  if (typeof data.firstCrackSec !== 'number' || isNaN(data.firstCrackSec)) {
    errors.firstCrackSec = '请输入有效的一爆秒数'
  } else if (data.firstCrackSec < 60 || data.firstCrackSec > 900) {
    errors.firstCrackSec = '一爆秒数应在 60-900 秒之间'
  }

  if (typeof data.dischargeTemp !== 'number' || isNaN(data.dischargeTemp)) {
    errors.dischargeTemp = '请输入有效的出豆温度'
  } else if (data.dischargeTemp < 150 || data.dischargeTemp > 350) {
    errors.dischargeTemp = '出豆温度应在 150-350°C 之间'
  }

  if (!errors.chargeTemp && !errors.dischargeTemp) {
    if (data.dischargeTemp <= data.chargeTemp) {
      errors.dischargeTemp = '出豆温度应高于入豆温度'
    }
  }

  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

export function formatErrors(errors: ValidationErrors): string {
  return Object.values(errors).filter(Boolean).join('；')
}
