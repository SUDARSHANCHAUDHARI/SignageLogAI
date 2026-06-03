import type { Investigation } from './types'
import { getInvestigationRepository } from './storage'

export async function saveInvestigation(investigation: Investigation): Promise<void> {
  await getInvestigationRepository().save(investigation)
}

export async function getInvestigation(id: string): Promise<Investigation | undefined> {
  return getInvestigationRepository().get(id)
}

export async function listInvestigations(): Promise<Investigation[]> {
  return getInvestigationRepository().list()
}
