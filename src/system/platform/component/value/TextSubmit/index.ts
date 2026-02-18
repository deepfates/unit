import { Field } from '../../../../../Class/Field'
import { System } from '../../../../../system'
import { ID_TEXT_SUBMIT } from '../../../../_ids'

export interface I {
  style: object
  value: string
  attr: object
}

export interface O {
  value: string
}

export default class TextSubmit extends Field<'value', I, O> {
  constructor(system: System) {
    super(
      {
        i: ['value', 'style', 'attr'],
        o: ['value'],
      },
      {},
      system,
      ID_TEXT_SUBMIT,
      'value'
    )

    this._defaultState = {
      value: '',
    }
  }
}
