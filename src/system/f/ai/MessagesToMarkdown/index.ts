import { Functional } from '../../../../Class/Functional'
import { Done } from '../../../../Class/Functional/Done'
import { System } from '../../../../system'
import { ID_MESSAGES_TO_MARKDOWN } from '../../../_ids'

interface Message {
  role: string
  content: string
}

export interface I {
  messages: Message[]
}

export interface O {
  text: string
}

export default class MessagesToMarkdown extends Functional<I, O> {
  constructor(system: System) {
    super(
      {
        i: ['messages'],
        o: ['text'],
      },
      {},
      system,
      ID_MESSAGES_TO_MARKDOWN
    )
  }

  f({ messages }: I, done: Done<O>): void {
    const text = messages
      .map((msg) => {
        const label = msg.role === 'user' ? '**You**' : '**Assistant**'

        return `${label}\n\n${msg.content}`
      })
      .join('\n\n---\n\n')

    done({ text })
  }
}
