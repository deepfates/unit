import { Functional } from '../../../../Class/Functional'
import { Done } from '../../../../Class/Functional/Done'
import { System } from '../../../../system'
import { Dict } from '../../../../types/Dict'
import { ID_SPECS_REFERENCE } from '../../../_ids'

export interface I {
  specs: Dict<any>
}

export interface O {
  reference: string
}

const SKIP_TAGS = new Set([
  'api',
  'component',
  'canvas',
  'svg',
  'event',
  'media',
  'audio',
  'bluetooth',
  'crypto',
  'style',
  'speech',
  'geolocation',
  'gamepad',
  'vibration',
  'wakelock',
  'notification',
  'storage',
  'peer',
  'popover',
  'pointer',
  'animation',
  'clipboard',
  'observer',
  'host',
  'share',
  'rest',
  'http',
  'network',
  'typed',
  'image',
  'file',
  'form',
  'children',
])

export default class SpecsReference extends Functional<I, O> {
  constructor(system: System) {
    super(
      {
        i: ['specs'],
        o: ['reference'],
      },
      {},
      system,
      ID_SPECS_REFERENCE
    )
  }

  f({ specs }: I, done: Done<O>): void {
    const lines: string[] = []

    for (const id in specs) {
      const spec = specs[id]

      if (!spec || !spec.name) {
        continue
      }

      if (spec.render) {
        continue
      }

      const tags: string[] = spec.metadata?.tags || []

      if (tags.some((t: string) => SKIP_TAGS.has(t))) {
        continue
      }

      if (
        tags.includes('platform') &&
        !tags.includes('method') &&
        !tags.includes('process')
      ) {
        continue
      }

      const inputs = spec.inputs || {}
      const outputs = spec.outputs || {}

      const inPins = Object.keys(inputs)
        .map((k) => {
          const t = inputs[k]?.type

          return t && t !== 'any' ? `${k}:${t}` : k
        })
        .join(',')

      const outPins = Object.keys(outputs)
        .map((k) => {
          const t = outputs[k]?.type

          return t && t !== 'any' ? `${k}:${t}` : k
        })
        .join(',')

      const desc = spec.metadata?.description || ''

      lines.push(
        `${id}|${spec.name}|${inPins || '-'}=>${outPins || '-'}${desc ? '|' + desc : ''}`
      )
    }

    done({ reference: lines.join('\n') })
  }
}
