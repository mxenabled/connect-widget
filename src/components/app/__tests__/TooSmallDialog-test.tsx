import React from 'react'

import { render, screen } from 'src/connect/utilities/testingLibrary'
import { waitFor } from '@testing-library/react'

import * as globalUtilities from 'src/connect/utilities/global'
import * as browserUtils from 'src/connect/utilities/Browser'
import { TooSmallDialog } from 'src/components/app/TooSmallDialog'

describe('TooSmallDialog', () => {
  it('should not show the dialog if trueWidth is greater than 320px', async () => {
    jest.spyOn(browserUtils, 'getTrueWindowWidth').mockReturnValueOnce(322)
    const onAnalyticPageview = jest.fn()
    render(<TooSmallDialog onAnalyticPageview={onAnalyticPageview} />)
    expect(screen.queryByText('Unsupported Resolution')).not.toBeInTheDocument()
    expect(onAnalyticPageview).not.toHaveBeenCalled()
  })
  describe('Less than 320px trueWidth', () => {
    beforeEach(() => {
      jest.spyOn(browserUtils, 'getTrueWindowWidth').mockReturnValueOnce(300)
    })
    it('should show the dialog if the environemt is other than production', async () => {
      jest
        .spyOn<any, string>(globalUtilities, 'getEnvironment')
        .mockReturnValueOnce(globalUtilities.Environments.INTEGRATION)
      render(<TooSmallDialog onAnalyticPageview={() => {}} />)
      expect(screen.queryByText('Unsupported Resolution')).toBeInTheDocument()
    })
    it('should not show the dialog if the environemt is production', async () => {
      jest
        .spyOn<any, string>(globalUtilities, 'getEnvironment')
        .mockReturnValue(globalUtilities.Environments.PRODUCTION)
      render(<TooSmallDialog onAnalyticPageview={() => {}} />)
      expect(screen.queryByText('Unsupported Resolution')).not.toBeInTheDocument()
    })
    it('should dismiss the dialog if the dismiss button is clicked', async () => {
      jest
        .spyOn<any, string>(globalUtilities, 'getEnvironment')
        .mockReturnValue(globalUtilities.Environments.INTEGRATION)
      const { user } = render(<TooSmallDialog onAnalyticPageview={() => {}} />)
      await user.click(screen.getByText('Dismiss'))
      await waitFor(() => {
        expect(screen.queryByText('Unsupported Resolution')).not.toBeInTheDocument()
      })
    })
    it('should call onAnalyticPageview if the environemt is other than production', async () => {
      jest
        .spyOn<any, string>(globalUtilities, 'getEnvironment')
        .mockReturnValueOnce(globalUtilities.Environments.INTEGRATION)
      const onAnalyticPageview = jest.fn()
      render(<TooSmallDialog onAnalyticPageview={onAnalyticPageview} />)
      await waitFor(() => expect(onAnalyticPageview).toHaveBeenCalled())
    })
  })
})
