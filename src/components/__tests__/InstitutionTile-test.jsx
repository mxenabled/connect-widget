import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { InstitutionTile } from '../InstitutionTile'

describe('<InstitutionTile />', () => {
  it('renders the logoUrl in the src if there is one', () => {
    const institution = {
      name: 'testName',
      logo_url: 'testLogoUrl',
    }

    render(<InstitutionTile institution={institution} selectInstitution={() => {}} />)

    expect(screen.getByAltText(`${institution.name} logo`)).toHaveAttribute(
      'src',
      institution.logo_url,
    )
  })

  it('renders a generated url with the guid if there is no logoUrl', () => {
    const institution = {
      guid: 'testGuid',
      name: 'testName',
    }

    render(<InstitutionTile institution={institution} selectInstitution={() => {}} />)

    expect(screen.getByAltText(`${institution.name} logo`).src.includes(institution.guid)).toBe(
      true,
    )
  })
})
