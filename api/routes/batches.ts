import { Router, type Request, type Response } from 'express'
import { getAll, getById, save } from '../store/fileStore.js'
import { generateTemperatureSamples } from '../utils/sampleGenerator.js'
import { validateCreateBatch, hasErrors, formatErrors } from '../utils/validator.js'
import type { Batch, CreateBatchRequest } from '../../shared/types.js'

const router = Router()

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

router.get('/', (req: Request, res: Response) => {
  const { beanType } = req.query
  let batches = getAll()

  if (beanType && typeof beanType === 'string' && beanType.trim() !== '') {
    batches = batches.filter((b) =>
      b.beanType.toLowerCase().includes(beanType.toLowerCase().trim())
    )
  }

  batches.sort((a, b) => new Date(b.roastDate).getTime() - new Date(a.roastDate).getTime())

  res.status(200).json({
    success: true,
    data: batches,
  })
})

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const batch = getById(id)

  if (!batch) {
    res.status(404).json({
      success: false,
      error: '批次不存在',
    })
    return
  }

  res.status(200).json({
    success: true,
    data: batch,
  })
})

router.post('/', (req: Request, res: Response) => {
  const body = req.body as CreateBatchRequest

  const parsedBody: CreateBatchRequest = {
    beanType: typeof body.beanType === 'string' ? body.beanType.trim() : body.beanType,
    roastDate: body.roastDate,
    chargeTemp: typeof body.chargeTemp === 'string' ? parseFloat(body.chargeTemp) : body.chargeTemp,
    firstCrackSec: typeof body.firstCrackSec === 'string' ? parseFloat(body.firstCrackSec) : body.firstCrackSec,
    dischargeTemp: typeof body.dischargeTemp === 'string' ? parseFloat(body.dischargeTemp) : body.dischargeTemp,
  }

  const errors = validateCreateBatch(parsedBody)
  if (hasErrors(errors)) {
    res.status(400).json({
      success: false,
      error: formatErrors(errors),
      details: errors,
    })
    return
  }

  const samples = generateTemperatureSamples(parsedBody)
  const batch: Batch = {
    id: generateId(),
    beanType: parsedBody.beanType,
    roastDate: parsedBody.roastDate,
    chargeTemp: parsedBody.chargeTemp,
    firstCrackSec: parsedBody.firstCrackSec,
    dischargeTemp: parsedBody.dischargeTemp,
    samples,
    createdAt: new Date().toISOString(),
  }

  save(batch)

  res.status(201).json({
    success: true,
    data: batch,
  })
})

export default router
