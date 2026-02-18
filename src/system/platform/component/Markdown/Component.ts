import HTMLElement_ from '../../../../client/html'
import { System } from '../../../../system'
import { Dict } from '../../../../types/Dict'
import { markdownToHtml, sanitize } from '../markdownUtils'

export interface Props {
  style?: Dict<string>
  attr?: Dict<string>
  text?: string
}

export default class Markdown extends HTMLElement_<HTMLDivElement, Props> {
  constructor($props: Props, $system: System) {
    const $element = $system.api.document.createElement('div')

    super(
      $props,
      $system,
      $element,
      $system.style['div'] || {},
      {},
      {
        text: (text: string | undefined) => {
          $element.innerHTML = sanitize(markdownToHtml(text || ''))
        },
      }
    )

    const { text } = $props

    if (text !== undefined) {
      $element.innerHTML = sanitize(markdownToHtml(text))
    }
  }
}
