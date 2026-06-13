const STORAGE_KEY = 'zbx_compare_selection'
const MAX_SELECTION = 4

export function getStoredSelection(beanType: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (parsed.beanType !== (beanType || '__all__')) return []
    return Array.isArray(parsed.ids) ? parsed.ids : []
  } catch {
    return []
  }
}

export function setStoredSelection(beanType: string, ids: string[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ beanType: beanType || '__all__', ids })
    )
  } catch {
    // ignore
  }
}

export function clearStoredSelection(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function toggleSelection(
  current: string[],
  id: string
): { next: string[]; changed: boolean } {
  const exists = current.includes(id)
  if (exists) {
    return { next: current.filter((x) => x !== id), changed: true }
  }
  if (current.length >= MAX_SELECTION) {
    return { next: current, changed: false }
  }
  return { next: [...current, id], changed: true }
}

export const COMPARE_MAX = MAX_SELECTION
