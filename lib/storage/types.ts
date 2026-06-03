import type { Investigation } from '../types'

export interface InvestigationRepository {
  save(investigation: Investigation): Promise<void>
  get(id: string): Promise<Investigation | undefined>
  list(): Promise<Investigation[]>
}
