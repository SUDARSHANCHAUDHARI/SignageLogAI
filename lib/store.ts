import type { Investigation } from './types'

// In-memory store — lost on server restart (Phase 1 only)
const investigations = new Map<string, Investigation>()

export function saveInvestigation(investigation: Investigation): void {
  investigations.set(investigation.id, investigation)
}

export function getInvestigation(id: string): Investigation | undefined {
  return investigations.get(id)
}

export function listInvestigations(): Investigation[] {
  return Array.from(investigations.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
