import React, { useState, useImperativeHandle, useContext } from 'react'
import { Text } from '@kyper/mui'
import { Button, TextField } from '@mui/material'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { AttentionFilled } from '@kyper/icon/AttentionFilled'
import { useTokens } from '@kyper/tokenprovider'

import { __ } from 'src/utilities/Intl'
import { ThankYouMessage } from 'src/components/ThankYouMessage'
import { AnalyticContext } from 'src/Connect'

interface ConnectSuccessSurveyProps {
  handleBack: () => void
  handleDone: () => void
}
interface Answer {
  [key: number]: string
}

type SurveyRating = {
  1: string
  2: string
  3: string
  4: string
  5: string
} & {
  [key: number]: string
}

export const SURVEY_QUESTIONS = [
  {
    question: () => __('The account connection tool was easy to use.'),
    type: 'number',
  },
  {
    question: () => __('The account connection process met my needs.'),
    type: 'number',
  },
  {
    question: () => __('Do you have any other feedback?'),
    type: 'text',
  },
]

const SURVEY_RATING: SurveyRating = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
}

export const ConnectSuccessSurvey = React.forwardRef<
  ConnectSuccessImperativeHandle,
  ConnectSuccessSurveyProps
>(({ handleBack, handleDone }, connectSuccessSurveyRef) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer>({})
  const [showThankYouMessage, setShowThankYouMessage] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const { onSubmitConnectSuccessSurvey } = useContext(AnalyticContext)

  const tokens = useTokens()
  const styles = getStyles(tokens)

  useImperativeHandle(connectSuccessSurveyRef, () => {
    return {
      handleConnectSuccessSurveyBackButton() {
        if (currentQuestionIndex === 0) {
          handleBack()
        } else {
          setCurrentQuestionIndex(currentQuestionIndex - 1)
          setShowErrorMessage(false)
        }
      },
    }
  }, [currentQuestionIndex])

  const handleToggleButtonChange = (questionIndex: number, answer: string) => {
    if (answer !== null) {
      setAnswers({ ...answers, [questionIndex]: answer })
      setShowErrorMessage(false)
    }
  }

  const handleTextFieldChange = (questionIndex: number, answer: string) => {
    setAnswers({ ...answers, [questionIndex]: answer })
  }

  const handleContinue = () => {
    if (currentQuestionIndex in answers) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowErrorMessage(true)
    }
  }

  const sendFeedback = () => {
    onSubmitConnectSuccessSurvey!(answers)
    setShowThankYouMessage(true)
  }

  const currentQuestion = SURVEY_QUESTIONS[currentQuestionIndex]

  return (
    <div>
      {showThankYouMessage ? (
        <ThankYouMessage handleDone={handleDone} />
      ) : (
        <React.Fragment>
          <div style={styles.surveyQuestion}>
            <Text component="h2" truncate={false} variant="H2">
              {currentQuestion.question()}
            </Text>
            {currentQuestion.type === 'number' ? (
              <React.Fragment>
                <ToggleButtonGroup
                  aria-label="Platform"
                  color="primary"
                  exclusive={true}
                  onChange={(_, newSelected) =>
                    handleToggleButtonChange(currentQuestionIndex, newSelected)
                  }
                  style={styles.toggleButtonGroup}
                  value={answers[currentQuestionIndex]}
                >
                  {Object.keys(SURVEY_RATING).map((key) => {
                    return (
                      <ToggleButton
                        key={key}
                        style={styles.toggleButton}
                        sx={{
                          color: '#2C64EF',
                          '&.Mui-selected': {
                            backgroundColor: '#2C64EF',
                            color: tokens.TextColor.Light,
                            boxShadow: 'none',
                          },
                        }}
                        value={SURVEY_RATING[+key]}
                      >
                        {key}
                      </ToggleButton>
                    )
                  })}
                </ToggleButtonGroup>
                <div style={styles.boundLabels}>
                  <Text bold={true} variant="Small">
                    {__('Strongly disagree')}
                  </Text>
                  <Text bold={true} variant="Small">
                    {__('Strongly agree')}
                  </Text>
                </div>
              </React.Fragment>
            ) : (
              <div style={styles.textQuestion}>
                <Text style={styles.textQuestionTitle} variant="Paragraph">
                  {__('Please let us know how we can improve.')}
                </Text>
                <TextField
                  autoFocus={true}
                  multiline={true}
                  onChange={(e) => handleTextFieldChange(currentQuestionIndex, e.target.value)}
                  rows={4}
                  value={answers[currentQuestionIndex]}
                />
              </div>
            )}
            {showErrorMessage && (
              <div style={styles.errorMessage}>
                <AttentionFilled color="#E32727" size={16} style={styles.errorIcon} />
                <Text color="#E32727" sx={{ fontSize: '12px' }} variant="XSmall">
                  {__('Please select an option before continuing.')}
                </Text>
              </div>
            )}
            {currentQuestionIndex === SURVEY_QUESTIONS.length - 1 ? (
              <Button
                fullWidth={true}
                onClick={sendFeedback}
                style={styles.button}
                variant="contained"
              >
                {__('Send feedback')}
              </Button>
            ) : (
              <Button
                fullWidth={true}
                onClick={handleContinue}
                style={styles.button}
                variant="contained"
              >
                {__('Continue')}
              </Button>
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  )
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => ({
  checkMarkIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: tokens.Spacing.XLarge,
  },
  toggleButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: '4px',
    marginTop: tokens.Spacing.XLarge,
    marginBottom: '10px',
  },
  toggleButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: '1 0 0',
    height: '48px',
    padding: '12px',
    border: '1px solid #8994A2',
    fontWeight: tokens.FontWeight.Semibold,
  },
  surveyQuestion: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,
  thankYouContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boundLabels: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '10px',
  },
  button: {
    marginTop: tokens.Spacing.XLarge,
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  errorIcon: {
    marginRight: tokens.Spacing.Tiny,
  },
  textQuestion: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: tokens.Spacing.Large,
  } as React.CSSProperties,
  textQuestionTitle: {
    marginBottom: tokens.Spacing.Medium,
  },
})

ConnectSuccessSurvey.displayName = 'ConnectSuccessSurvey'
