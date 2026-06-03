import { MemoryInvestigationRepository } from './memory'
import type { InvestigationRepository } from './types'

const repository: InvestigationRepository = new MemoryInvestigationRepository()

export function getInvestigationRepository(): InvestigationRepository {
  return repository
}
