import { Functional } from '../../../../Class/Functional'
import { Done } from '../../../../Class/Functional/Done'
import { System } from '../../../../system'
import { ID_CHAT_MESSAGE } from '../../../_ids'

export interface I {
  role: string
  content: string
}

export interface O {
  message: { role: string; content: string }
}

export default class ChatMessage extends Functional<I, O> {
  constructor(system: System) {
    super(
      {
        i: ['role', 'content'],
        o: ['message'],
      },
      {},
      system,
      ID_CHAT_MESSAGE
    )
  }

  f({ role, content }: I, done: Done<O>): void {
    done({ message: { role, content } })
  }
}
