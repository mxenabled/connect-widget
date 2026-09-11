/*!
 * gettext.js - CSP-compliant implementation
 * Evaluates GNU gettext plural forms safely without eval() or new Function().
 */

/**
 * Parses and safely evaluates GNU gettext plural form expressions without dynamic code execution.
 * Grammar supports:
 *   - Variables: 'n'
 *   - Integer numbers
 *   - Arithmetic operators: +, -, *, /, % (with integer division)
 *   - Comparison operators: ==, !=, <, <=, >, >=
 *   - Logical operators: &&, ||, !
 *   - Conditional (ternary): ? :
 *   - Grouping: ( )
 */
function evaluatePluralExpression(expr, n) {
  let pos = 0
  const str = expr.replace(/\s+/g, '')

  function parseTernary() {
    const condition = parseOr()
    if (str[pos] === '?') {
      pos++ // skip '?'
      const trueBranch = parseTernary()
      if (str[pos] !== ':') {
        throw new Error(`Expected ':' at position ${pos} in plural expression: ${expr}`)
      }
      pos++ // skip ':'
      const falseBranch = parseTernary()
      return condition ? trueBranch : falseBranch
    }
    return condition
  }

  function parseOr() {
    let val = parseAnd()
    while (str.slice(pos, pos + 2) === '||') {
      pos += 2
      const right = parseAnd()
      val = val || right
    }
    return val
  }

  function parseAnd() {
    let val = parseEquality()
    while (str.slice(pos, pos + 2) === '&&') {
      pos += 2
      const right = parseEquality()
      val = val && right
    }
    return val
  }

  function parseEquality() {
    let val = parseRelational()
    while (str.slice(pos, pos + 2) === '==' || str.slice(pos, pos + 2) === '!=') {
      const op = str.slice(pos, pos + 2)
      pos += 2
      const right = parseRelational()
      val = op === '==' ? Number(val) === Number(right) : Number(val) !== Number(right)
    }
    return val
  }

  function parseRelational() {
    let val = parseAddSub()
    while (
      str.slice(pos, pos + 2) === '<=' ||
      str.slice(pos, pos + 2) === '>=' ||
      str[pos] === '<' ||
      str[pos] === '>'
    ) {
      if (str.slice(pos, pos + 2) === '<=') {
        pos += 2
        val = Number(val) <= Number(parseAddSub())
      } else if (str.slice(pos, pos + 2) === '>=') {
        pos += 2
        val = Number(val) >= Number(parseAddSub())
      } else if (str[pos] === '<') {
        pos++
        val = Number(val) < Number(parseAddSub())
      } else if (str[pos] === '>') {
        pos++
        val = Number(val) > Number(parseAddSub())
      }
    }
    return val
  }

  function parseAddSub() {
    let val = parseMulDivMod()
    while (str[pos] === '+' || str[pos] === '-') {
      const op = str[pos]
      pos++
      const right = parseMulDivMod()
      val = op === '+' ? Number(val) + Number(right) : Number(val) - Number(right)
    }
    return val
  }

  function parseMulDivMod() {
    let val = parseUnary()
    while (str[pos] === '*' || str[pos] === '/' || str[pos] === '%') {
      const op = str[pos]
      pos++
      const right = parseUnary()
      if (op === '*') {
        val = Number(val) * Number(right)
      } else if (op === '/') {
        val = Number(right) !== 0 ? Math.floor(Number(val) / Number(right)) : 0
      } else if (op === '%') {
        val = Number(right) !== 0 ? Number(val) % Number(right) : 0
      }
    }
    return val
  }

  function parseUnary() {
    if (str[pos] === '!') {
      pos++
      return !parseUnary()
    }
    if (str[pos] === '+') {
      pos++
      return +parseUnary()
    }
    if (str[pos] === '-') {
      pos++
      return -parseUnary()
    }
    return parsePrimary()
  }

  function parsePrimary() {
    if (str[pos] === '(') {
      pos++
      const val = parseTernary()
      if (str[pos] !== ')') {
        throw new Error(`Expected ')' at position ${pos} in plural expression: ${expr}`)
      }
      pos++
      return val
    }
    if (str[pos] === 'n') {
      pos++
      return n
    }
    const numMatch = str.slice(pos).match(/^[0-9]+/)
    if (numMatch) {
      pos += numMatch[0].length
      return parseInt(numMatch[0], 10)
    }
    throw new Error(`Unexpected token at position ${pos} in plural expression: ${expr}`)
  }

  return parseTernary()
}

const compilePluralForm = function (pluralForm) {
  const npluralsMatch = pluralForm.match(/nplurals\s*=\s*([0-9]+)/)
  const pluralMatch = pluralForm.match(/plural\s*=\s*([^;]+)/)

  if (!npluralsMatch || !pluralMatch) {
    throw new Error(`The plural form "${pluralForm}" is not valid`)
  }

  const nplurals = parseInt(npluralsMatch[1], 10)
  const expr = pluralMatch[1].trim()

  return function (n) {
    const rawResult = evaluatePluralExpression(expr, typeof n === 'number' ? n : Number(n) || 0)
    let plural = 0
    if (rawResult === true) {
      plural = 1
    } else if (rawResult) {
      plural = Number(rawResult)
    }

    return {
      nplurals,
      plural,
    }
  }
}

const i18n = function (options) {
  const opts = options || {}
  if (this) {
    this.__version = '2.0.0'
  }

  const defaults = {
    domain: 'messages',
    locale:
      (typeof document !== 'undefined' ? document.documentElement.getAttribute('lang') : false) ||
      'en',
    plural_func: function (n) {
      return { nplurals: 2, plural: n !== 1 ? 1 : 0 }
    },
    ctxt_delimiter: String.fromCharCode(4), // \u0004
  }

  const _ = {
    isObject: function (obj) {
      const type = typeof obj
      return type === 'function' || (type === 'object' && !!obj)
    },
  }

  const _plural_funcs = {}
  let _locale = opts.locale || defaults.locale
  let _domain = opts.domain || defaults.domain
  const _dictionary = {}
  const _plural_forms = {}
  const _ctxt_delimiter = opts.ctxt_delimiter || defaults.ctxt_delimiter

  if (opts.messages) {
    _dictionary[_domain] = {}
    _dictionary[_domain][_locale] = opts.messages
  }

  if (opts.plural_forms) {
    _plural_forms[_locale] = opts.plural_forms
  }

  const strfmt = function (fmt) {
    const args = arguments
    return fmt
      .replace(/%%/g, '%% ')
      .replace(/%(\d+)/g, function (_str, p1) {
        return args[p1]
      })
      .replace(/%% /g, '%')
  }

  const removeContext = function (str) {
    if (str.indexOf(_ctxt_delimiter) !== -1) {
      const parts = str.split(_ctxt_delimiter)
      return parts[1]
    }
    return str
  }

  const expand_locale = function (locale) {
    const locales = [locale]
    let curLocale = locale
    let i = curLocale.lastIndexOf('-')
    while (i > 0) {
      curLocale = curLocale.slice(0, i)
      locales.push(curLocale)
      i = curLocale.lastIndexOf('-')
    }
    return locales
  }

  const normalizeLocale = function (locale) {
    let normalized = locale.replace('_', '-')
    const i = normalized.search(/[.@]/)
    if (i !== -1) {
      normalized = normalized.slice(0, i)
    }
    return normalized
  }

  const getPluralFunc = function (plural_form) {
    const pf_re = new RegExp(
      '^\\s*nplurals\\s*=\\s*[0-9]+\\s*;\\s*plural\\s*=\\s*(?:\\s|[-\\?\\|&=!<>+*/%:;n0-9_\\(\\)])+',
    )
    const match = plural_form.match(pf_re)

    if (!match || match[0] !== plural_form) {
      throw new Error(strfmt('The plural form "%1" is not valid', plural_form))
    }

    return compilePluralForm(plural_form)
  }

  const t = function (messages, n, tOptions /* , extra */) {
    if (!tOptions.plural_form) {
      return strfmt.apply(
        this,
        [removeContext(messages[0])].concat(Array.prototype.slice.call(arguments, 3)),
      )
    }

    let plural
    if (tOptions.plural_func) {
      plural = tOptions.plural_func(n)
    } else if (!_plural_funcs[_locale]) {
      _plural_funcs[_locale] = getPluralFunc(_plural_forms[_locale])
      plural = _plural_funcs[_locale](n)
    } else {
      plural = _plural_funcs[_locale](n)
    }

    if (
      typeof plural.plural === 'undefined' ||
      plural.plural > plural.nplurals ||
      messages.length <= plural.plural
    ) {
      plural.plural = 0
    }

    return strfmt.apply(
      this,
      [removeContext(messages[plural.plural])].concat(Array.prototype.slice.call(arguments, 3)),
    )
  }

  return {
    strfmt,
    expand_locale,

    __: function () {
      return this.gettext.apply(this, arguments)
    },
    _n: function () {
      return this.ngettext.apply(this, arguments)
    },
    _p: function () {
      return this.pgettext.apply(this, arguments)
    },

    setMessages: function (domain, locale, messages, plural_forms) {
      if (!domain || !locale || !messages) {
        throw new Error('You must provide a domain, a locale and messages')
      }

      if (typeof domain !== 'string' || typeof locale !== 'string' || !_.isObject(messages)) {
        throw new Error('Invalid arguments')
      }

      const normalizedLocale = normalizeLocale(locale)

      if (plural_forms) {
        _plural_forms[normalizedLocale] = plural_forms
      }

      if (!_dictionary[domain]) {
        _dictionary[domain] = {}
      }

      _dictionary[domain][normalizedLocale] = messages

      return this
    },

    loadJSON: function (jsonData, domain) {
      const data =
        typeof jsonData === 'object' && jsonData !== null ? jsonData : JSON.parse(jsonData)

      if (!data[''] || !data['']['language'] || !data['']['plural-forms']) {
        throw new Error(
          'Wrong JSON, it must have an empty key ("") with "language" and "plural-forms" information',
        )
      }

      const headers = data['']
      delete data['']

      return this.setMessages(
        domain || defaults.domain,
        headers['language'],
        data,
        headers['plural-forms'],
      )
    },

    setLocale: function (locale) {
      _locale = normalizeLocale(locale)
      return this
    },

    getLocale: function () {
      return _locale
    },

    textdomain: function (domain) {
      if (!domain) {
        return _domain
      }
      _domain = domain
      return this
    },

    gettext: function (msgid /* , extra */) {
      return this.dcnpgettext.apply(
        this,
        [undefined, undefined, msgid, undefined, undefined].concat(
          Array.prototype.slice.call(arguments, 1),
        ),
      )
    },

    ngettext: function (msgid, msgid_plural, n /* , extra */) {
      return this.dcnpgettext.apply(
        this,
        [undefined, undefined, msgid, msgid_plural, n].concat(
          Array.prototype.slice.call(arguments, 3),
        ),
      )
    },

    pgettext: function (msgctxt, msgid /* , extra */) {
      return this.dcnpgettext.apply(
        this,
        [undefined, msgctxt, msgid, undefined, undefined].concat(
          Array.prototype.slice.call(arguments, 2),
        ),
      )
    },

    dcnpgettext: function (domain, msgctxt, msgid, msgid_plural, n /* , extra */) {
      const currentDomain = domain || _domain

      if (typeof msgid !== 'string') {
        throw new Error(this.strfmt('Msgid "%1" is not a valid translatable string', msgid))
      }

      let translation
      const options = { plural_form: false }
      const key = msgctxt ? msgctxt + _ctxt_delimiter + msgid : msgid
      let exist
      let foundLocale
      const locales = expand_locale(_locale)

      for (const localeCandidate of locales) {
        exist =
          _dictionary[currentDomain] &&
          _dictionary[currentDomain][localeCandidate] &&
          _dictionary[currentDomain][localeCandidate][key]

        if (msgid_plural) {
          exist = exist && typeof _dictionary[currentDomain][localeCandidate][key] !== 'string'
        } else {
          exist = exist && typeof _dictionary[currentDomain][localeCandidate][key] === 'string'
        }
        if (exist) {
          foundLocale = localeCandidate
          break
        }
      }

      if (!exist) {
        translation = msgid
        options.plural_func = defaults.plural_func
      } else {
        translation = _dictionary[currentDomain][foundLocale][key]
      }

      if (!msgid_plural) {
        return t.apply(
          this,
          [[translation], n, options].concat(Array.prototype.slice.call(arguments, 5)),
        )
      }

      options.plural_form = true
      return t.apply(
        this,
        [exist ? translation : [msgid, msgid_plural], n, options].concat(
          Array.prototype.slice.call(arguments, 5),
        ),
      )
    },
  }
}

export default i18n
