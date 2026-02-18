import { Field } from '../../../../../client/field'
import { System } from '../../../../../system'
import { Dict } from '../../../../../types/Dict'

export interface Props {
  className?: string
  style?: Dict<any>
  value?: string
  attr?: Dict<any>
}

export default class TextSubmit extends Field<HTMLInputElement, Props> {
  constructor($props: Props, $system: System) {
    super($props, $system, $system.api.document.createElement('input'), {
      valueKey: 'value',
      defaultStyle: $system.style['textfield'],
      defaultValue: '',
      emit: false,
      defaultAttr: {
        type: 'text',
        placeholder: 'Type and press Enter...',
        spellcheck: false,
        autocomplete: 'off',
        autocapitalize: 'off',
        inputmode: $system.flags.defaultInputModeNone ? 'none' : 'text',
      },
    })

    this.$element.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()

        const value = this.$element.value

        if (value !== '') {
          this.set('value', value)
          this.dispatchEvent('value', value)

          this.$element.value = ''
        }
      }
    })
  }
}
