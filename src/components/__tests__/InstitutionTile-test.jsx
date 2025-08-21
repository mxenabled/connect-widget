import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { act } from 'react'
import { InstitutionTile } from '../InstitutionTile'

describe('<InstitutionTile />', () => {
  it('renders the logoUrl in the src if there is one', async () => {
    const institution = {
      name: 'testName',
      logo_url: 'testLogoUrl',
    }

    await act(async () => {
      render(<InstitutionTile institution={institution} selectInstitution={() => {}} />)
    })

    expect(screen.getByAltText(`${institution.name} logo`)).toHaveAttribute(
      'src',
      institution.logo_url,
    )
  })

  it('renders a generated url with the guid if there is no logoUrl', async () => {
    const institution = {
      guid: 'testGuid',
      name: 'testName',
    }

    await act(async () => {
      render(<InstitutionTile institution={institution} selectInstitution={() => {}} />)
    })

    expect(screen.getByAltText(`${institution.name} logo`).src.includes(institution.guid)).toBe(
      true,
    )
  })

  it('renders a disabled Chip if the institution is disabled', async () => {
    const institution = {
      guid: 'testGuid',
      name: 'testName',
      is_disabled_by_client: true,
    }

    await act(async () => {
      render(<InstitutionTile institution={institution} selectInstitution={() => {}} />)
    })

    expect(screen.getByText('DISABLED')).toBeInTheDocument()
  })

  it('does not render a disabled Chip if the institution is not disabled', async () => {
    const institution = {
      guid: 'testGuid',
      name: 'testName',
      is_disabled_by_client: false,
    }

    await act(async () => {
      render(<InstitutionTile institution={institution} selectInstitution={() => {}} />)
    })

    expect(screen.queryByText('DISABLED')).not.toBeInTheDocument()
  })
})
