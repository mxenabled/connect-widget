import React from 'react'
import { createTestReduxStore, render, screen } from 'src/utilities/testingLibrary'
import { InstitutionGridTile } from '../InstitutionGridTile'
import createBrowserActions from 'src/redux/actions/Browser'

describe('<InstitutionGridTile />', () => {
  it('renders the logoUrl in the src if there is one', () => {
    const institution = {
      name: 'testName',
      logo_url: 'testLogoUrl',
    }

    const store = createTestReduxStore()

    store.dispatch(createBrowserActions(store.dispatch).updateDimensions())

    render(<InstitutionGridTile institution={institution} selectInstitution={() => {}} />, {
      store,
    })

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

    const store = createTestReduxStore()

    store.dispatch(createBrowserActions(store.dispatch).updateDimensions())

    render(<InstitutionGridTile institution={institution} selectInstitution={() => {}} />, {
      store,
    })

    expect(screen.getByAltText(`${institution.name} logo`)).toHaveAttribute(
      'src',
      institution.logo_url,
    )
  })
})
