import React from 'react'
import { describe, expect, it } from 'vitest'

import { SearchFailed } from 'src/views/search/views/SearchFailed'
import { render, screen } from 'src/utilities/testingLibrary'

describe('SearchFailed', () => {
  it('renders the search error title and message', () => {
    render(<SearchFailed />)

    expect(screen.getByText(/Search isn.t working/)).toBeVisible()
    expect(screen.getByText('Something went wrong. Please try again.')).toBeVisible()
  })
})
