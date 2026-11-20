import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { createInitialState } from './demo-state.js'

const { Pool } = pg
const mode = process.env.DATA_MODE ?? 'memory'
const pool = mode === 'postgres' ? new Pool({ connectionString: process.env.DATABASE_URL }) : null
let memoryState = null
let writeQueue = Promise.resolve()

function copy(value) {
  return JSON.parse(JSON.stringify(value))
}

export async function initializeStore() {
  if (!pool) {
    memoryState ??= createInitialState()
    return { mode: 'memory-demo' }
  }

  const migrationPath = fileURLToPath(new URL('../migrations/001_demo_state.sql', import.meta.url))
  await pool.query(await readFile(migrationPath, 'utf8'))
  const current = await pool.query('SELECT state FROM prototype_state WHERE id = 1')
  if (current.rowCount === 0) {
    const initialState = createInitialState()
    await pool.query('INSERT INTO prototype_state (id, state) VALUES (1, $1::jsonb) ON CONFLICT (id) DO NOTHING', [JSON.stringify(initialState)])
  }
  return { mode: 'postgres-demo' }
}

async function loadState() {
  if (!pool) {
    memoryState ??= createInitialState()
    return memoryState
  }
  const result = await pool.query('SELECT state FROM prototype_state WHERE id = 1')
  if (result.rowCount === 0) throw new Error('Prototype state has not been initialized')
  return result.rows[0].state
}

async function persistState(state) {
  if (!pool) {
    memoryState = state
    return
  }
  await pool.query('INSERT INTO prototype_state (id, state, updated_at) VALUES (1, $1::jsonb, now()) ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state, updated_at = now()', [JSON.stringify(state)])
}

export async function readState() {
  return copy(await loadState())
}

export function updateState(mutator) {
  const operation = writeQueue.then(async () => {
    const state = await loadState()
    const result = await mutator(state)
    await persistState(state)
    return { state: copy(state), result: copy(result) }
  })
  writeQueue = operation.catch(() => undefined)
  return operation
}

export function getStoreMode() {
  return pool ? 'postgres-demo' : 'memory-demo'
}

export function resetMemoryStore() {
  if (pool) throw new Error('Memory store cannot be reset while PostgreSQL mode is active')
  memoryState = createInitialState()
  writeQueue = Promise.resolve()
}

export async function closeStore() {
  if (pool) await pool.end()
}