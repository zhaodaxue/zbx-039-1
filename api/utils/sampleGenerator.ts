import type { CreateBatchRequest } from '../../shared/types.js'

export function generateTemperatureSamples(data: CreateBatchRequest): number[] {
  const { chargeTemp, firstCrackSec, dischargeTemp } = data
  const totalMinutes = 12
  const firstCrackMin = firstCrackSec / 60
  const samples: number[] = []

  for (let i = 0; i < totalMinutes; i++) {
    let temp: number

    if (i === 0) {
      temp = chargeTemp
    } else if (i <= Math.floor(firstCrackMin)) {
      const progress = i / firstCrackMin
      const firstCrackTemp = chargeTemp + 90
      temp = chargeTemp + progress * (firstCrackTemp - chargeTemp)
      temp += (Math.random() - 0.5) * 4
    } else if (i < totalMinutes - 1) {
      const elapsedAfterFirstCrack = i - firstCrackMin
      const remaining = (totalMinutes - 1) - firstCrackMin
      const progress = elapsedAfterFirstCrack / remaining
      const firstCrackTemp = chargeTemp + 90
      temp = firstCrackTemp + progress * (dischargeTemp - firstCrackTemp)
      temp += (Math.random() - 0.5) * 3
    } else {
      temp = dischargeTemp
    }

    samples.push(Math.round(temp * 10) / 10)
  }

  return samples
}
