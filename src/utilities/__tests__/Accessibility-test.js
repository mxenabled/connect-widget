import { focusElement } from 'src/utilities/Accessibility'

describe('Accessibility Utils', () => {
  describe('focusElement', () => {
    const focus = vi.fn()

    beforeEach(() => {
      focus.mockClear()
    })

    describe('focusElement', () => {
      it('should call focus if it has it', () => {
        focusElement({ focus })
        expect(focus).toHaveBeenCalled()
      })
      it('should not call focus if it does not have it', () => {
        focusElement({})
        expect(focus).not.toHaveBeenCalled()
      })
      it('should not call focus if it does not exist', () => {
        focusElement()
        expect(focus).not.toHaveBeenCalled()
      })
    })
  })
})
