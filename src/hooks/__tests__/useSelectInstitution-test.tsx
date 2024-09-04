import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'src/redux/Store'
import { screen, render } from 'src/utilities/testingLibrary'
import useSelectInstitution from 'src/hooks/useSelectInstitution'
import { institutionData } from 'src/services/mockedData'

const TestSelectInstitutionComponent = () => {
  const selectedInstitution = useSelector((state: RootState) => state.connect.selectedInstitution)
  const { handleSelectInstitution } = useSelectInstitution()
  return (
    <div>
      <button onClick={() => handleSelectInstitution(institutionData.institution.guid)}>
        select institution
      </button>
      <p>Selected institution: {selectedInstitution.name}</p>
    </div>
  )
}

describe('useSelectInstitution', () => {
  it('allows you to select an instution', async () => {
    const { user } = render(<TestSelectInstitutionComponent />)
    const paragraph = screen.getByText(/selected institution/i)
    const button = screen.getByText(/select institution/i)

    expect(paragraph).toHaveTextContent('Selected institution:')

    await user.click(button)

    expect(paragraph).toHaveTextContent(`Selected institution: ${institutionData.institution.name}`)
  })
})
