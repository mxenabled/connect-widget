import React from 'react'
import { render, screen, fireEvent } from 'src/utilities/testingLibrary'
import { InstitutionBlock } from 'src/components/InstitutionBlock'

describe('InstitutionBlock', () => {
  const defaultProps = {
    institution: {
      guid: 'INS-123',
      name: 'test',
      url: 'test@email.com',
    },
    style: {},
  }

  it('renders institution logo if the guid is valid', () => {
    render(<InstitutionBlock {...defaultProps} />)

    const image = screen.getByAltText(`${defaultProps.institution.name} logo`)

    expect(image).toHaveAttribute(
      'src',
      `https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/${defaultProps.institution.guid}_100x100.png`,
    )
  })

  it('renders a default institution logo if there is an error', () => {
    render(<InstitutionBlock {...defaultProps} />)

    const image = screen.getByAltText(`${defaultProps.institution.name} logo`)
    fireEvent.error(image)

    expect(image).toHaveAttribute(
      'src',
      'https://content.moneydesktop.com/storage/MD_Assets/serenity/default_institution_logo.png',
    )
  })

  it('it displays intitution name  if guid does not start with "INS-MANUAL"', () => {
    render(<InstitutionBlock {...defaultProps} />)
    expect(screen.getByText(defaultProps.institution.name)).toBeInTheDocument()
  })

  it('it displays intitution name  if guid is invalid', () => {
    const newDeaultProps = {
      ...defaultProps,
      institution: { ...defaultProps.institution, guid: undefined },
    }
    render(<InstitutionBlock {...newDeaultProps} />)
    expect(screen.getByText(defaultProps.institution.name)).toBeInTheDocument()
  })

  it('it displays "Manual Institution" as institution name if guid starts with "INS-MANUAL" ', () => {
    const newDeaultProps = {
      ...defaultProps,
      institution: { ...defaultProps.institution, guid: 'INS-MANUAL-123' },
    }
    render(<InstitutionBlock {...newDeaultProps} />)
    expect(screen.getByText('Manual Institution')).toBeInTheDocument()
  })
})
