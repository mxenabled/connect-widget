import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'

import { __, _n, _np, B, loadJSON, setLocale } from 'src/utilities/Intl'
import es from 'src/const/language/es.json'
import frCa from 'src/const/language/frCa.json'

describe('Intl', () => {
  it('__ should produce text', () => {
    const TestComponent = (
      <B>{__('This is a *bold* statement. And *so* is this. But *not this.')}</B>
    )
    render(TestComponent)

    expect(
      screen.getAllByText(
        (_, node) =>
          node?.textContent === 'This is a bold statement. And so is this. But *not this.',
      )[0],
    ).toBeInTheDocument()
  })

  it('_np should produce text', () => {
    const TestComponent = <B>{_np('appearance', 'He is fair.', 'They are fair.', 2)}</B>
    render(TestComponent)

    expect(screen.getByText('They are fair.')).toBeInTheDocument()
  })

  it('should not have strong elements', () => {
    const TestComponent = <B>{__('This is a statement.')}</B>
    render(TestComponent)

    expect(screen.queryAllByText((_text, element) => element?.tagName === 'STRONG')).toHaveLength(0)
  })

  it('should have strong elements', () => {
    const TestComponent = (
      <B>{__('This is a *bold* statement. And *so* is this. But *not this.')}</B>
    )
    render(TestComponent)
    const boldComponents = screen.queryAllByText((_text, element) => element?.tagName === 'STRONG')

    expect(boldComponents).toHaveLength(2)
  })

  describe('Plural translations with Content Security Policy (no unsafe-eval)', () => {
    let originalFunction: typeof globalThis.Function

    beforeEach(() => {
      originalFunction = globalThis.Function
    })

    afterEach(() => {
      globalThis.Function = originalFunction
    })

    it('translates Spanish plurals without violating CSP unsafe-eval', () => {
      loadJSON(structuredClone(es))
      setLocale('es')

      // Disallow any dynamic code evaluation / new Function to simulate strict CSP
      globalThis.Function = function () {
        throw new EvalError(
          "Evaluating a string as JavaScript violates the following Content Security Policy directive because 'unsafe-eval' is not an allowed source of script",
        )
      } as unknown as typeof Function

      // Singular (1)
      expect(_n('%1 search result', '%1 search results', 1, 1)).toBe('1 resultado de búsqueda')
      // Plural (2)
      expect(_n('%1 search result', '%1 search results', 2, 2)).toBe('2 Resultados de la búsqueda')
    })

    it('translates French Canadian plurals without violating CSP unsafe-eval', () => {
      loadJSON(structuredClone(frCa))
      setLocale('fr-ca')

      // Disallow any dynamic code evaluation / new Function to simulate strict CSP
      globalThis.Function = function () {
        throw new EvalError(
          "Evaluating a string as JavaScript violates the following Content Security Policy directive because 'unsafe-eval' is not an allowed source of script",
        )
      } as unknown as typeof Function

      // Singular (1)
      expect(_n('%1 search result', '%1 search results', 1, 1)).toBe('1 résultat de recherche')
      // Plural (2)
      expect(_n('%1 search result', '%1 search results', 2, 2)).toBe('2 résultats de recherche')
    })
  })
})
