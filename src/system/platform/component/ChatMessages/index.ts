import { Element_ } from '../../../../Class/Element'
import { System } from '../../../../system'
import { Dict } from '../../../../types/Dict'
import { ID_CHAT_MESSAGES } from '../../../_ids'

export interface I {
  style: object
  attr: Dict<string>
  messages: { role: string; content: string }[]
}

export interface O {}

export default class ChatMessages extends Element_<I, O> {
  constructor(system: System) {
    super(
      {
        i: ['style', 'attr', 'messages'],
        o: [],
      },
      {},
      system,
      ID_CHAT_MESSAGES
    )
  }
}
