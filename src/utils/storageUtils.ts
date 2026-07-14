function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readStorageJson(key: string): unknown {
  if (!isStorageAvailable()) {
    return null
  }

  const raw = window.localStorage.getItem(key)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeStorageJson(key: string, value: unknown): void {
  if (!isStorageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Erro ao salvar dados:', error)
  }
}
