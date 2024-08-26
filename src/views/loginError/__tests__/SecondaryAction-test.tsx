import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'

import {
  GET_HELP,
  DISCONNECT_INSTITUTION,
  VISIT_WEBSITE,
  TRY_ANOTHER_INSTITUTION,
} from 'src/views/loginError/consts'
import * as globalUtilities from 'src/utilities/global'
import { SecondaryActions } from 'src/views/loginError/SecondaryActions'

describe('SecondaryActions', () => {
  const defaultProps = {
    actions: [VISIT_WEBSITE],
    institution: { guid: 'INS-123', url: 'institution_url.com' },
    isDeleteInstitutionOptionEnabled: true,
    member: { guid: 'MBR-123', is_managed_by_user: true },
    onDeleteConnectionClick: vi.fn(),
    onGetHelpClick: vi.fn(),
    onTryAnotherInstitutionClick: vi.fn(),
    setIsLeaving: vi.fn(),
    showExternalLinkPopup: false,
    showSupport: true,
  }
  const goToUrlLinkSpy = vi.spyOn(globalUtilities, 'goToUrlLink').mockImplementation(() => {})

  // VISIT_WEBSITE
  it('should render actions[VISIT_WEBSITE] without leaving popup', async () => {
    const { user } = render(<SecondaryActions {...defaultProps} />)
    const button = screen.getByText("Go to bank's website")

    expect(button).toBeInTheDocument()
    await user.click(button)
    expect(goToUrlLinkSpy).toHaveBeenCalledWith(defaultProps.institution.url)
  })
  it('should render actions[VISIT_WEBSITE] with leaving popup', async () => {
    const { user } = render(
      <SecondaryActions
        {...{
          ...defaultProps,
          showExternalLinkPopup: true,
        }}
      />,
    )
    const button = screen.getByText("Go to bank's website")

    expect(button).toBeInTheDocument()
    await user.click(button)
    expect(defaultProps.setIsLeaving).toHaveBeenCalled()
  })

  // TRY_ANOTHER_INSTITUTION
  it('should render actions[TRY_ANOTHER_INSTITUTION]', async () => {
    const { user } = render(
      <SecondaryActions {...{ ...defaultProps, actions: [TRY_ANOTHER_INSTITUTION] }} />,
    )
    const button = screen.getByText('Try another institution')

    expect(button).toBeInTheDocument()
    await user.click(button)
    expect(defaultProps.onTryAnotherInstitutionClick).toHaveBeenCalled()
  })

  // GET_HELP
  it('should render actions[GET_HELP]', async () => {
    const { user } = render(<SecondaryActions {...{ ...defaultProps, actions: [GET_HELP] }} />)
    const button = screen.getByText('Get help')

    expect(button).toBeInTheDocument()
    await user.click(button)
    expect(defaultProps.onGetHelpClick).toHaveBeenCalled()
  })
  it('should not render actions[GET_HELP] when showSupport is false', async () => {
    render(
      <SecondaryActions
        {...{
          ...defaultProps,
          actions: [GET_HELP],
          showSupport: false,
        }}
      />,
    )

    expect(screen.queryByText('Get help')).not.toBeInTheDocument()
  })

  // DISCONNECT_INSTITUTION
  it('should render actions[DISCONNECT_INSTITUTION]', async () => {
    const { user } = render(
      <SecondaryActions
        {...{
          ...defaultProps,
          actions: [DISCONNECT_INSTITUTION],
        }}
      />,
    )

    await user.click(screen.getByText('Disconnect this institution'))
    expect(defaultProps.onDeleteConnectionClick).toHaveBeenCalled()
  })
  it('should not render actions[DISCONNECT_INSTITUTION] when isDeleteInstitutionOptionEnabled is false', async () => {
    render(
      <SecondaryActions
        {...{
          ...defaultProps,
          actions: [DISCONNECT_INSTITUTION],
          isDeleteInstitutionOptionEnabled: false,
        }}
      />,
    )

    expect(screen.queryByText('Disconnect this institution')).not.toBeInTheDocument()
  })
})
