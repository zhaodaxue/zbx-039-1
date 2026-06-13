import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Batch } from '../../shared/types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.resolve(process.cwd(), 'api/data/batches.json')

function ensureDataFile(): void {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8')
  }
}

function readAll(): Batch[] {
  ensureDataFile()
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw) as Batch[]
}

function writeAll(batches: Batch[]): void {
  ensureDataFile()
  fs.writeFileSync(DATA_FILE, JSON.stringify(batches, null, 2), 'utf-8')
}

export function getAll(): Batch[] {
  return readAll()
}

export function getById(id: string): Batch | undefined {
  return readAll().find((b) => b.id === id)
}

export function save(batch: Batch): void {
  const batches = readAll()
  batches.push(batch)
  writeAll(batches)
}
