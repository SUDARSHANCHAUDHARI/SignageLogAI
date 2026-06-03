import type { Investigation } from '../types'
import type { InvestigationRepository } from './types'

export class MemoryInvestigationRepository implements InvestigationRepository {
  private readonly investigations = new Map<string, Investigation>()

  async save(investigation: Investigation): Promise<void> {
    this.investigations.set(investigation.id, investigation)
  }

  async get(id: string): Promise<Investigation | undefined> {
    return this.investigations.get(id)
  }

  async list(): Promise<Investigation[]> {
    return Array.from(this.investigations.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
}
