import i18n from 'src/utilities/gettext'

describe('gettext safe implementation', () => {
  let originalFunction

  beforeEach(() => {
    originalFunction = globalThis.Function
  })

  afterEach(() => {
    globalThis.Function = originalFunction
  })

  describe('CSP compliance', () => {
    it('evaluates plural forms without invoking new Function or eval', () => {
      globalThis.Function = function () {
        throw new EvalError('CSP unsafe-eval violation')
      }

      const instance = i18n()
      instance.loadJSON({
        '': {
          language: 'es',
          'plural-forms': 'nplurals=2; plural=(n != 1);',
        },
        '%1 apple': ['%1 manzana', '%1 manzanas'],
      })
      instance.setLocale('es')

      expect(instance.ngettext('%1 apple', '%1 apples', 1, 1)).toBe('1 manzana')
      expect(instance.ngettext('%1 apple', '%1 apples', 5, 5)).toBe('5 manzanas')
    })
  })

  describe('Plural expression evaluator rules', () => {
    const simulateCsp = () => {
      globalThis.Function = function () {
        throw new EvalError('CSP unsafe-eval violation')
      }
    }

    it('handles nplurals=1; plural=0; (e.g., Japanese, Chinese)', () => {
      simulateCsp()
      const instance = i18n()
      instance.loadJSON({
        '': {
          language: 'ja',
          'plural-forms': 'nplurals=1; plural=0;',
        },
        '%1 item': ['%1 個のアイテム'],
      })
      instance.setLocale('ja')

      expect(instance.ngettext('%1 item', '%1 items', 1, 1)).toBe('1 個のアイテム')
      expect(instance.ngettext('%1 item', '%1 items', 0, 0)).toBe('0 個のアイテム')
      expect(instance.ngettext('%1 item', '%1 items', 10, 10)).toBe('10 個のアイテム')
    })

    it('handles nplurals=2; plural=(n > 1); (French standard)', () => {
      simulateCsp()
      const instance = i18n()
      instance.loadJSON({
        '': {
          language: 'fr',
          'plural-forms': 'nplurals=2; plural=(n > 1);',
        },
        '%1 file': ['%1 fichier', '%1 fichiers'],
      })
      instance.setLocale('fr')

      // 0 is singular in French
      expect(instance.ngettext('%1 file', '%1 files', 0, 0)).toBe('0 fichier')
      // 1 is singular
      expect(instance.ngettext('%1 file', '%1 files', 1, 1)).toBe('1 fichier')
      // 2 is plural
      expect(instance.ngettext('%1 file', '%1 files', 2, 2)).toBe('2 fichiers')
    })

    it('handles complex ternary and modulo (Slavic/Russian plural rule)', () => {
      simulateCsp()
      const instance = i18n()
      instance.loadJSON({
        '': {
          language: 'ru',
          'plural-forms':
            'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
        },
        '%1 book': ['%1 книга', '%1 книги', '%1 книг'],
      })
      instance.setLocale('ru')

      expect(instance.ngettext('%1 book', '%1 books', 1, 1)).toBe('1 книга')
      expect(instance.ngettext('%1 book', '%1 books', 21, 21)).toBe('21 книга')
      expect(instance.ngettext('%1 book', '%1 books', 2, 2)).toBe('2 книги')
      expect(instance.ngettext('%1 book', '%1 books', 4, 4)).toBe('4 книги')
      expect(instance.ngettext('%1 book', '%1 books', 5, 5)).toBe('5 книг')
      expect(instance.ngettext('%1 book', '%1 books', 11, 11)).toBe('11 книг')
    })

    it('handles complex ternary with multiple branches (Arabic plural rule)', () => {
      simulateCsp()
      const instance = i18n()
      instance.loadJSON({
        '': {
          language: 'ar',
          'plural-forms':
            'nplurals=6; plural=(n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5);',
        },
        '%1 book': ['0', '1', '2', '3-10', '11+', 'other'],
      })
      instance.setLocale('ar')

      expect(instance.ngettext('%1 book', '%1 books', 0)).toBe('0')
      expect(instance.ngettext('%1 book', '%1 books', 1)).toBe('1')
      expect(instance.ngettext('%1 book', '%1 books', 2)).toBe('2')
      expect(instance.ngettext('%1 book', '%1 books', 5)).toBe('3-10')
      expect(instance.ngettext('%1 book', '%1 books', 15)).toBe('11+')
      expect(instance.ngettext('%1 book', '%1 books', 102)).toBe('other')
    })
  })

  describe('General gettext features', () => {
    it('translates singular strings with __ and gettext', () => {
      const instance = i18n()
      instance.loadJSON({
        '': {
          language: 'es',
          'plural-forms': 'nplurals=2; plural=(n != 1);',
        },
        Hello: 'Hola',
      })
      instance.setLocale('es')

      expect(instance.gettext('Hello')).toBe('Hola')
      expect(instance.__('Hello')).toBe('Hola')
    })

    it('translates contextual strings with _p and pgettext', () => {
      const instance = i18n()
      instance.loadJSON({
        '': {
          language: 'fr',
          'plural-forms': 'nplurals=2; plural=(n!=1);',
        },
        'menu\u0004File': 'Fichier',
      })
      instance.setLocale('fr')

      expect(instance.pgettext('menu', 'File')).toBe('Fichier')
      expect(instance._p('menu', 'File')).toBe('Fichier')
    })

    it('interpolates placeholders with %1, %2', () => {
      const instance = i18n()
      expect(instance.strfmt('%1 has %2 items', 'Logan', 3)).toBe('Logan has 3 items')
    })

    it('falls back to msgid when translation is missing', () => {
      const instance = i18n()
      instance.setLocale('fr')
      expect(instance.gettext('Unknown')).toBe('Unknown')
      expect(instance.ngettext('%1 result', '%1 results', 1, 1)).toBe('1 result')
      expect(instance.ngettext('%1 result', '%1 results', 5, 5)).toBe('5 results')
    })
  })
})
