import { Functional } from '../../../../Class/Functional'
import { Done } from '../../../../Class/Functional/Done'
import { System } from '../../../../system'
import { Dict } from '../../../../types/Dict'
import { ID_PROMPT_TEMPLATE } from '../../../_ids'

export interface I {
  template: string
  vars: Dict<string>
}

export interface O {
  text: string
}

export default class PromptTemplate extends Functional<I, O> {
  constructor(system: System) {
    super(
      {
        i: ['template', 'vars'],
        o: ['text'],
      },
      {},
      system,
      ID_PROMPT_TEMPLATE
    )
  }

  f({ template, vars }: I, done: Done<O>): void {
    const text = template.replace(
      /\{(\w+)\}/g,
      (_, key) => (vars[key] !== undefined ? String(vars[key]) : `{${key}}`)
    )

    done({ text })
  }
}
