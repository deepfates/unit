import { Element_ } from '../../../../Class/Element'
import { System } from '../../../../system'
import { Dict } from '../../../../types/Dict'
import { ID_MARKDOWN } from '../../../_ids'

export interface I {
  style: object
  attr: Dict<string>
  text: string
}

export interface O {}

export default class Markdown extends Element_<I, O> {
  constructor(system: System) {
    super(
      {
        i: ['style', 'attr', 'text'],
        o: [],
      },
      {},
      system,
      ID_MARKDOWN
    )
  }
}
