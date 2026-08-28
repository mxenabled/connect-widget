import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { FlushListContainer } from 'src/shared/MuiList/FlushListContainer'

describe('<FlushListContainer />', () => {
  it('renders its children', () => {
    const childContent = 'Child content'

    render(
      <FlushListContainer>
        <div>{childContent}</div>
      </FlushListContainer>,
    )

    expect(screen.getByText(childContent)).toBeInTheDocument()
  })
})
