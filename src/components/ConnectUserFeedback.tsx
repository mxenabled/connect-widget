import React, { useState, useEffect, useContext } from 'react'
import { Text } from '@kyper/mui'
import { Button } from '@mui/material'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { CheckmarkFilled as CheckmarkFilledIcon } from '@kyper/icon/CheckmarkFilled'
import { useTokens } from '@kyper/tokenprovider'

import { __ } from 'src/utilities/Intl'
import { SlideDown } from 'src/components/SlideDown'
import { AnalyticContext } from 'src/Connect'

export const ConnectUserFeedback: React.FC<ConnectUserFeedbackProps> = ({ handleDone }) => {
  const { onAnalyticEvent, onShowAnalyticSurvey } = useContext(AnalyticContext)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showThankYouMessage, setShowThankYouMessage] = useState(false)

  const { fetchSurvey, survey } = onShowAnalyticSurvey()

  const tokens = useTokens()
  const styles = getStyles(tokens)

  const handleToggleButtonChange = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer })
  }
  const sendFeedback = () => {
    onAnalyticEvent('survey sent', {
      $survey_id: survey.id,
      $survey_name: survey.name,
      $survey_response: answers['0'],
      $survey_response_1: answers['1'],
    })
    setShowThankYouMessage(true)
  }

  useEffect(() => {
    fetchSurvey('Connect widget feedback')
  }, [])

  const currentQuestion = survey?.questions[currentQuestionIndex]

  return (
    <div>
      {showThankYouMessage ? (
        <SlideDown>
          <div style={styles.thankYouContainer}>
            <CheckmarkFilledIcon color={tokens.Color.Success300} size={48} />
            <Text component="h2" style={styles.thankYouMessage} truncate={false} variant="H2">
              {__('Thank you for your feedback!')}
            </Text>
            <Button fullWidth={true} onClick={handleDone} style={styles.button} variant="contained">
              {__('Done')}
            </Button>
          </div>
        </SlideDown>
      ) : (
        <React.Fragment>
          {survey && (
            <div style={styles.surveyQuestion}>
              <h2>{currentQuestion.question}</h2>
              <ToggleButtonGroup
                aria-label="Platform"
                color="primary"
                exclusive={true}
                onChange={(e) =>
                  handleToggleButtonChange(currentQuestion.originalQuestionIndex, e.target.value)
                }
                value={answers[currentQuestionIndex]}
              >
                <ToggleButton value="1">1</ToggleButton>
                <ToggleButton value="2">2</ToggleButton>
                <ToggleButton value="3">3</ToggleButton>
                <ToggleButton value="4">4</ToggleButton>
                <ToggleButton value="5">5</ToggleButton>
              </ToggleButtonGroup>
              {currentQuestionIndex === survey.questions.length - 1 ? (
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
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  style={styles.button}
                  variant="contained"
                >
                  {__('Continue')}
                </Button>
              )}
            </div>
          )}
        </React.Fragment>
      )}
    </div>
  )
}

const getStyles = (tokens) => ({
  surveyQuestion: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: tokens.Spacing.SuperJumbo,
  },
  thankYouMessage: {
    marginTop: tokens.Spacing.Large,
  },
})
