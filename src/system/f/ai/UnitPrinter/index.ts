import { Functional } from '../../../../Class/Functional'
import { Done } from '../../../../Class/Functional/Done'
import { System } from '../../../../system'
import { ID_UNIT_PRINTER_PROMPT } from '../../../_ids'
import { UNIT_PRINTER_SYSTEM_PROMPT } from './prompt'

export interface I {
  any: any
}

export interface O {
  template: string
}

export default class UnitPrinterPrompt extends Functional<I, O> {
  constructor(system: System) {
    super(
      {
        i: ['any'],
        o: ['template'],
      },
      {},
      system,
      ID_UNIT_PRINTER_PROMPT
    )
  }

  f({}: I, done: Done<O>): void {
    done({ template: UNIT_PRINTER_SYSTEM_PROMPT })
  }
}
