import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { Investigation } from '../types'
import type { InvestigationRepository } from './types'

export class FileInvestigationRepository implements InvestigationRepository {
  private readonly filePath: string
  private writeQueue = Promise.resolve()

  constructor(dataDir = process.env.SIGNAGE_DATA_DIR ?? join(process.cwd(), '.signage-data')) {
    this.filePath = join(dataDir, 'investigations.json')
  }

  async save(investigation: Investigation): Promise<void> {
    await this.withWriteLock(async () => {
      const investigations = await this.readAll()
      const next = new Map(investigations.map(item => [item.id, item]))
      next.set(investigation.id, investigation)
      await this.writeAll(Array.from(next.values()))
    })
  }

  async get(id: string): Promise<Investigation | undefined> {
    return (await this.readAll()).find(investigation => investigation.id === id)
  }

  async list(): Promise<Investigation[]> {
    return (await this.readAll()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  private async readAll(): Promise<Investigation[]> {
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed as Investigation[] : []
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      throw error
    }
  }

  private async writeAll(investigations: Investigation[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true })
    const tempPath = `${this.filePath}.tmp`
    await writeFile(tempPath, `${JSON.stringify(investigations, null, 2)}\n`, 'utf8')
    await rename(tempPath, this.filePath)
  }

  private async withWriteLock(operation: () => Promise<void>): Promise<void> {
    this.writeQueue = this.writeQueue.then(operation, operation)
    return this.writeQueue
  }
}
