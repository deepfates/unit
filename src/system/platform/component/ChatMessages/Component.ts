import HTMLElement_ from '../../../../client/html'
import { System } from '../../../../system'
import { Dict } from '../../../../types/Dict'
import { markdownToHtml, sanitize } from '../markdownUtils'

interface Message {
  role: string
  content: string
}

export interface Props {
  style?: Dict<string>
  attr?: Dict<string>
  messages?: Message[]
}

export default class ChatMessages extends HTMLElement_<HTMLDivElement, Props> {
  constructor($props: Props, $system: System) {
    const $element = $system.api.document.createElement('div')

    super(
      $props,
      $system,
      $element,
      {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        overflowY: 'auto',
        padding: '12px',
        ...($system.style['div'] || {}),
      },
      {},
      {
        messages: (messages: Message[] | undefined) => {
          renderMessages($element, messages || [], $system)
        },
      }
    )

    const { messages } = $props

    if (messages !== undefined) {
      renderMessages($element, messages, $system)
    }
  }
}

function renderMessages(
  container: HTMLDivElement,
  messages: Message[],
  system: System
): void {
  container.innerHTML = ''

  for (const msg of messages) {
    const bubble = system.api.document.createElement('div')
    const isUser = msg.role === 'user'

    bubble.style.maxWidth = '80%'
    bubble.style.padding = '10px 14px'
    bubble.style.borderRadius = '12px'
    bubble.style.fontSize = '14px'
    bubble.style.lineHeight = '1.5'
    bubble.style.wordWrap = 'break-word'

    if (isUser) {
      bubble.style.marginLeft = 'auto'
      bubble.style.background = '#2d5a8e'
      bubble.style.color = '#e8e8e8'
      bubble.style.borderBottomRightRadius = '4px'
    } else {
      bubble.style.marginRight = 'auto'
      bubble.style.background = '#2a2a3e'
      bubble.style.color = '#e0e0e0'
      bubble.style.borderBottomLeftRadius = '4px'
    }

    bubble.innerHTML = sanitize(markdownToHtml(msg.content))

    container.appendChild(bubble)
  }

  container.scrollTop = container.scrollHeight
}
