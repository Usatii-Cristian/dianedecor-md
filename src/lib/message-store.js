import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Fail-safe store for contact messages.
 *
 * A submitted enquiry is a lead; losing one because MongoDB is not wired up yet
 * or is momentarily down is not acceptable. When Prisma cannot take the write,
 * the message lands here instead and still shows up in the admin inbox.
 *
 * Writes go to `.data/contact-messages.json` (gitignored) when the filesystem is
 * writable, and to memory otherwise — on read-only hosts such as Vercel that
 * means the entries survive only until the instance recycles, which is why this
 * is a safety net and not a replacement for the database.
 */

const STORE_DIRECTORY = path.join(process.cwd(), '.data')
const STORE_FILE = path.join(STORE_DIRECTORY, 'contact-messages.json')

const globalForStore = globalThis
globalForStore.contactMessageStore ??= null

function loadFromDisk() {
  try {
    return JSON.parse(readFileSync(STORE_FILE, 'utf8'))
  } catch {
    return []
  }
}

function getMemoryStore() {
  globalForStore.contactMessageStore ??= loadFromDisk()
  return globalForStore.contactMessageStore
}

function persist(messages) {
  try {
    mkdirSync(STORE_DIRECTORY, { recursive: true })
    writeFileSync(STORE_FILE, JSON.stringify(messages, null, 2), 'utf8')
    return true
  } catch (error) {
    console.warn('[message-store] could not persist to disk:', error.message)
    return false
  }
}

export function saveFallbackMessage(data) {
  const messages = getMemoryStore()
  const message = {
    ...data,
    id: `local-${randomUUID()}`,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  }

  messages.unshift(message)
  const persisted = persist(messages)
  return { message, persisted }
}

export function listFallbackMessages(status) {
  const messages = getMemoryStore().map((message) => ({
    ...message,
    eventDate: message.eventDate ? new Date(message.eventDate) : null,
    createdAt: new Date(message.createdAt),
  }))

  const filtered = status ? messages.filter((message) => message.status === status) : messages
  return filtered.sort((a, b) => b.createdAt - a.createdAt)
}

export function updateFallbackMessageStatus(id, status) {
  const messages = getMemoryStore()
  const message = messages.find((entry) => entry.id === id)
  if (!message) return null

  message.status = status
  persist(messages)
  return message
}

/** Ids created by this store are prefixed, so routes can tell them apart. */
export function isFallbackMessageId(id) {
  return typeof id === 'string' && id.startsWith('local-')
}
