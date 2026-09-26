// Case-insensitive "contains" regex for user-typed search text. Special
// characters are escaped, so input like ".*" is matched literally.
export function containsRegex(text, maxLength = 100) {
  const escaped = text.trim().slice(0, maxLength).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(escaped, 'i')
}
