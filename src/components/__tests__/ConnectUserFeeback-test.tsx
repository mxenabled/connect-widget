import React from 'react'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { ConnectUserFeedback, SURVEY_QUESTIONS } from 'src/components/ConnectUserFeedback'
import { AnalyticContext } from 'src/Connect'

describe('ConnectUserFeedback', () => {
  const handleBack = vi.fn()
  const handleDone = vi.fn()
  const onSubmitAnalyticSurvey = vi.fn()

  it('should show the first question when it loads', () => {
    render(<ConnectUserFeedback handleBack={handleBack} handleDone={handleDone} />)
    const firstQuestion = SURVEY_QUESTIONS[0].question
    expect(screen.getByText(firstQuestion)).toBeInTheDocument()
  })

  it('should move to the next question if continue button is cliked and the current question is answered if it is a number question', async () => {
    const { user } = render(<ConnectUserFeedback handleBack={handleBack} handleDone={handleDone} />)
    const secondQuestion = SURVEY_QUESTIONS[1].question
    const buttonRatingFour = screen.getByRole('button', { name: '4' })
    const continueButton = screen.getByRole('button', { name: /continue/i })

    await user.click(buttonRatingFour)
    await user.click(continueButton)

    expect(screen.getByText(secondQuestion)).toBeInTheDocument()
  })

  it('should show an error if continue button is cliked and the current question is not answered if it is a number question', async () => {
    const { user } = render(<ConnectUserFeedback handleBack={handleBack} handleDone={handleDone} />)
    const continueButton = screen.getByRole('button', { name: /continue/i })

    await user.click(continueButton)

    expect(
      await screen.findByText('Please select an option before continuing.'),
    ).toBeInTheDocument()
  })

  it('should submit survey responses to the analytics provider and show thank you message if sendFeedback button is clicked', async () => {
    const { user } = render(
      <AnalyticContext.Provider value={{ onSubmitAnalyticSurvey }}>
        <div id="connect-wrapper">
          <ConnectUserFeedback handleBack={handleBack} handleDone={handleDone} />
        </div>
      </AnalyticContext.Provider>,
    )
    const buttonRatingFour = screen.getByRole('button', { name: '4' })
    const continueButton = screen.getByRole('button', { name: /continue/i })

    for (let i = 1; i < SURVEY_QUESTIONS.length; i++) {
      await user.click(buttonRatingFour)
      await user.click(continueButton)
    }

    const sendFeedbackButton = screen.getByRole('button', { name: /Send feedback/i })

    await user.click(sendFeedbackButton)

    await waitFor(() => {
      expect(onSubmitAnalyticSurvey).toHaveBeenCalledWith('survey sent', {
        $survey_id: '01953a87-9632-0000-6f90-b84d6d2abf08',
        $survey_name: 'Connect success survey',
        $survey_response: '4',
        $survey_response_1: '4',
      })
    })
  })
})
