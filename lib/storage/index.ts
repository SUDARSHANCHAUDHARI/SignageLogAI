import { FileInvestigationRepository } from './file'
import { MemoryInvestigationRepository } from './memory'
import type { InvestigationRepository } from './types'

const repository: InvestigationRepository =
  process.env.SIGNAGE_STORAGE_DRIVER === 'memory'
    ? new MemoryInvestigationRepository()
    : new FileInvestigationRepository()

export function getInvestigationRepository(): InvestigationRepository {
  return repository
}
