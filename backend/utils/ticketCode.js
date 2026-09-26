import crypto from 'node:crypto'

// Easy to read aloud and type: no 0/O, 1/I/L.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

// e.g. "ASL-7K3M-9QX2" (~40 bits of randomness; uniqueness is also
// enforced by a unique index in the database).
export function generateTicketCode() {
  const bytes = crypto.randomBytes(8)
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
  return `ASL-${chars.slice(0, 4)}-${chars.slice(4, 8)}`
}
