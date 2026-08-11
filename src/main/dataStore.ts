import { app } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'
import type { DataFile } from '../shared/types'
import { seedMenuIfEmpty } from './seedOnFirstRun'

const SCHEMA_VERSION = 1

function getDataFilePath(): string {
  return path.join(app.getPath('userData'), 'data.json')
}

function defaultData(): DataFile {
  return {
    meta: { schemaVersion: SCHEMA_VERSION },
    settings: {
      cafeName: 'Café de Glacier',
      address: 'Hopar Valley, Nagar, Gilgit-Baltistan',
      phone: '',
      currencySymbol: 'Rs.',
      receiptFooterNote: 'See you soon!',
      nextReceiptNumber: 1
    },
    categories: [],
    items: [],
    orders: []
  }
}

let cache: DataFile | null = null
let writeQueue: Promise<unknown> = Promise.resolve()

async function readFromDisk(): Promise<DataFile> {
  const filePath = getDataFilePath()
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as DataFile
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      const fresh = defaultData()
      await persist(fresh)
      return fresh
    }
    throw err
  }
}

async function persist(data: DataFile): Promise<void> {
  const filePath = getDataFilePath()
  const tmpPath = `${filePath}.tmp`
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  await fs.rename(tmpPath, filePath)
}

async function ensureLoaded(): Promise<DataFile> {
  if (!cache) {
    const data = await readFromDisk()
    // Heals any install that never got a menu (e.g. an interrupted first run).
    if (seedMenuIfEmpty(data)) {
      await persist(data)
    }
    cache = data
  }
  return cache
}

/** Serializes every read/write through a single promise chain so concurrent IPC calls never interleave writes. */
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn)
  writeQueue = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

export function loadData(): Promise<DataFile> {
  return enqueue(() => ensureLoaded())
}

/** Runs `mutator` against the in-memory data, persists the result, and returns whatever `mutator` returns. */
export function mutate<T>(mutator: (data: DataFile) => T): Promise<T> {
  return enqueue(async () => {
    const data = await ensureLoaded()
    const result = mutator(data)
    await persist(data)
    return result
  })
}
