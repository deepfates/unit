export function sanitize(html: string): string {
  const cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=/gi, ' data-removed=')

  return cleaned.replace(
    /\s(href|src)\s*=\s*"([^"]*)"/gi,
    (_match, attr, rawValue) => {
      const value = String(rawValue).trim()
      const lower = value.toLowerCase()

      if (
        lower.startsWith('javascript:') ||
        lower.startsWith('data:') ||
        lower.startsWith('vbscript:')
      ) {
        return ` ${attr}="#"`
      }

      return ` ${attr}="${rawValue}"`
    }
  )
}

function inline(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const url = String(href).trim()
      const lower = url.toLowerCase()
      const blocked =
        lower.startsWith('javascript:') ||
        lower.startsWith('data:') ||
        lower.startsWith('vbscript:')
      const safeHref = blocked ? '#' : url.replace(/"/g, '&quot;')

      return `<a href="${safeHref}" target="_blank" rel="noopener">${label}</a>`
    })
}

export function markdownToHtml(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []
  let inCode = false
  let inList: 'ul' | 'ol' | '' = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('```')) {
      if (inCode) {
        out.push('</code></pre>')
        inCode = false
      } else {
        if (inList) {
          out.push(inList === 'ul' ? '</ul>' : '</ol>')
          inList = ''
        }

        out.push('<pre><code>')
        inCode = true
      }

      continue
    }

    if (inCode) {
      out.push(
        line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      )
      out.push('\n')

      continue
    }

    const trimmed = line.trim()

    if (trimmed === '') {
      if (inList) {
        out.push(inList === 'ul' ? '</ul>' : '</ol>')
        inList = ''
      }

      continue
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/)

    if (headingMatch) {
      if (inList) {
        out.push(inList === 'ul' ? '</ul>' : '</ol>')
        inList = ''
      }

      const level = headingMatch[1].length
      out.push(`<h${level}>${inline(headingMatch[2])}</h${level}>`)

      continue
    }

    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/)

    if (ulMatch) {
      if (inList !== 'ul') {
        if (inList) {
          out.push('</ol>')
        }

        out.push('<ul>')
        inList = 'ul'
      }

      out.push(`<li>${inline(ulMatch[1])}</li>`)

      continue
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/)

    if (olMatch) {
      if (inList !== 'ol') {
        if (inList) {
          out.push('</ul>')
        }

        out.push('<ol>')
        inList = 'ol'
      }

      out.push(`<li>${inline(olMatch[1])}</li>`)

      continue
    }

    if (inList) {
      out.push(inList === 'ul' ? '</ul>' : '</ol>')
      inList = ''
    }

    out.push(`<p>${inline(trimmed)}</p>`)
  }

  if (inCode) {
    out.push('</code></pre>')
  }

  if (inList) {
    out.push(inList === 'ul' ? '</ul>' : '</ol>')
  }

  return out.join('')
}
