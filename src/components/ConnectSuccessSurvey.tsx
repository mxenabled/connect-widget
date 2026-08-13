import React, { useState, useImperativeHandle, useContext } from 'react'
import { Icon, Text } from '@mxenabled/mxui'
import { Button, Stack, TextField } from '@mui/material'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

import { __ } from 'src/utilities/Intl'
import { ThankYouMessage } from 'src/components/ThankYouMessage'
import { AnalyticContext } from 'src/Connect'
import styles from 'src/components/ConnectSuccessSurvey.module.css'

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
  const isLastQuestion = currentQuestionIndex === SURVEY_QUESTIONS.length - 1

  return (
    <div>
      {showThankYouMessage ? (
        <ThankYouMessage handleDone={handleDone} />
      ) : (
        <Stack alignItems="center" justifyContent="center" spacing={4}>
          <Text component="h2" truncate={false} variant="H2">
            {currentQuestion.question()}
          </Text>
          {currentQuestion.type === 'number' ? (
            <React.Fragment>
              <ToggleButtonGroup
                aria-label="Platform"
                className={styles.toggleButtonGroup}
                color="primary"
                exclusive={true}
                onChange={(_, newSelected) =>
                  handleToggleButtonChange(currentQuestionIndex, newSelected)
                }
                value={answers[currentQuestionIndex]}
              >
                {Object.keys(SURVEY_RATING).map((key) => {
                  return (
                    <ToggleButton
                      className={styles.toggleButton}
                      key={key}
                      value={SURVEY_RATING[+key]}
                    >
                      {key}
                    </ToggleButton>
                  )
                })}
              </ToggleButtonGroup>
              <Stack
                alignItems="center"
                className={styles.boundLabels}
                direction="row"
                justifyContent="space-between"
              >
                <Text bold={true} variant="Small">
                  {__('Strongly disagree')}
                </Text>
                <Text bold={true} variant="Small">
                  {__('Strongly agree')}
                </Text>
              </Stack>
            </React.Fragment>
          ) : (
            <Stack className={styles.textQuestion} spacing={2}>
              <Text className={styles.textQuestionTitle} variant="Paragraph">
                {__('Please let us know how we can improve.')}
              </Text>
              <TextField
                autoFocus={true}
                multiline={true}
                onChange={(e) => handleTextFieldChange(currentQuestionIndex, e.target.value)}
                rows={4}
                value={answers[currentQuestionIndex]}
              />
            </Stack>
          )}
          {showErrorMessage && (
            <Stack
              alignItems="center"
              className={styles.errorMessage}
              direction="row"
              spacing={0.5}
            >
              <Icon color="error" fill={true} name="error" size={16} />
              <Text className={styles.errorMessageText} color="error" variant="XSmall">
                {__('Please select an option before continuing.')}
              </Text>
            </Stack>
          )}

          <Button
            fullWidth={true}
            onClick={isLastQuestion ? sendFeedback : handleContinue}
            variant="contained"
          >
            {isLastQuestion ? __('Send feedback') : __('Continue')}
          </Button>
        </Stack>
      )}
    </div>
  )
})

ConnectSuccessSurvey.displayName = 'ConnectSuccessSurvey'
