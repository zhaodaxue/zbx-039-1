export interface ValidationErrors {
  beanType?: string
  roastDate?: string
  chargeTemp?: string
  firstCrackSec?: string
  dischargeTemp?: string
}

export interface BatchFormData {
  beanType: string
  roastDate: string
  chargeTemp: string
  firstCrackSec: string
  dischargeTemp: string
}

export function validateBatchForm(data: BatchFormData): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!data.beanType.trim()) {
    errors.beanType = '请输入豆种名称'
  } else if (data.beanType.trim().length < 2) {
    errors.beanType = '豆种名称至少 2 个字符'
  }

  if (!data.roastDate) {
    errors.roastDate = '请选择烘焙日期'
  }

  const chargeTemp = parseFloat(data.chargeTemp)
  if (isNaN(chargeTemp)) {
    errors.chargeTemp = '请输入有效的入豆温度'
  } else if (chargeTemp < 100 || chargeTemp > 300) {
    errors.chargeTemp = '入豆温度应在 100-300°C 之间'
  }

  const firstCrackSec = parseFloat(data.firstCrackSec)
  if (isNaN(firstCrackSec)) {
    errors.firstCrackSec = '请输入有效的一爆秒数'
  } else if (firstCrackSec < 60 || firstCrackSec > 900) {
    errors.firstCrackSec = '一爆秒数应在 60-900 秒之间'
  }

  const dischargeTemp = parseFloat(data.dischargeTemp)
  if (isNaN(dischargeTemp)) {
    errors.dischargeTemp = '请输入有效的出豆温度'
  } else if (dischargeTemp < 150 || dischargeTemp > 350) {
    errors.dischargeTemp = '出豆温度应在 150-350°C 之间'
  }

  if (!errors.chargeTemp && !errors.dischargeTemp) {
    if (dischargeTemp <= chargeTemp) {
      errors.dischargeTemp = '出豆温度应高于入豆温度'
    }
  }

  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}
