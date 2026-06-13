import type { CreateBatchRequest } from '../../shared/types.js'

export function generateTemperatureSamples(data: CreateBatchRequest): number[] {
  const { chargeTemp, firstCrackSec, dischargeTemp } = data
  const totalMinutes = 12
  const firstCrackMin = Math.max(0.1, firstCrackSec / 60)
  const lastIndex = totalMinutes - 1
  const samples: number[] = []

  const maxFirstCrackRise = Math.max(30, dischargeTemp - chargeTemp - 10)
  const firstCrackTemp = chargeTemp + Math.min(90, maxFirstCrackRise)
  const useLinearRamp = firstCrackMin >= lastIndex - 1

  for (let i = 0; i < totalMinutes; i++) {
    let temp: number

    if (i === 0) {
      temp = chargeTemp
    } else if (i === lastIndex) {
      temp = dischargeTemp
    } else if (useLinearRamp) {
      const progress = i / lastIndex
      temp = chargeTemp + progress * (dischargeTemp - chargeTemp)
      temp += (Math.random() - 0.5) * 3
    } else if (i <= firstCrackMin) {
      const progress = i / firstCrackMin
      temp = chargeTemp + progress * (firstCrackTemp - chargeTemp)
      temp += (Math.random() - 0.5) * 4
    } else {
      const elapsedAfterFirstCrack = i - firstCrackMin
      const remaining = lastIndex - firstCrackMin
      const progress = remaining > 0 ? elapsedAfterFirstCrack / remaining : 1
      temp = firstCrackTemp + progress * (dischargeTemp - firstCrackTemp)
      temp += (Math.random() - 0.5) * 3
    }

    samples.push(Math.round(temp * 10) / 10)
  }

  return samples
}
