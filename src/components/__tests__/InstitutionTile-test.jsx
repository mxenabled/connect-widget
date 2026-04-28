import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { InstitutionTile } from '../InstitutionTile'
import { InstitutionStatusField } from 'src/utilities/institutionStatus'

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

  it('renders a disabled Chip if the institution is disabled', () => {
    const institution = {
      guid: 'testGuid',
      name: 'testName',
      is_disabled_by_client: true,
    }

    render(<InstitutionTile institution={institution} selectInstitution={() => {}} />)

    expect(screen.getByText('DISABLED')).toBeInTheDocument()
  })

  it('does not render a disabled Chip if the institution is not disabled', () => {
    const institution = {
      guid: 'testGuid',
      name: 'testName',
      is_disabled_by_client: false,
    }

    render(<InstitutionTile institution={institution} selectInstitution={() => {}} />)

    expect(screen.queryByText('DISABLED')).not.toBeInTheDocument()
  })

  it('renders an UNAVAILABLE Chip if the institution is unavailable by experiment values', () => {
    const institution = { guid: 'testGuid', name: 'testName' }
    const preloadedState = {
      experimentalFeatures: {
        unavailableInstitutions: [institution],
      },
    }

    render(<InstitutionTile institution={institution} selectInstitution={() => {}} />, {
      preloadedState,
    })

    expect(screen.getByText('UNAVAILABLE')).toBeInTheDocument()
  })

  it('renders an UNAVAILABLE Chip if the institution is unavailable by API', () => {
    const institution = {
      guid: 'testGuid',
      name: 'testName',
      status: InstitutionStatusField.UNAVAILABLE,
    }

    render(<InstitutionTile institution={institution} selectInstitution={() => {}} />)

    expect(screen.getByText('UNAVAILABLE')).toBeInTheDocument()
  })
})
