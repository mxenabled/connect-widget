import { useEffect } from 'react'
import { useWebSocketContext } from 'src/context/WebSocketContext'

export const useConnectingStream = ({
  member,
  _onTimeout,
  onMemberStatusUpdate,
  onPriorityDataReady,
  onCurrentJobFinished,
  _onMemberFullyConnected,
}: {
  member: MemberResponseType
  _onTimeout: () => void
  onMemberStatusUpdate: () => void
  onPriorityDataReady: () => void
  onCurrentJobFinished: () => void
  _onMemberFullyConnected: () => void
}) => {
  // Set up websocket connection
  const socketConnection = useWebSocketContext()

  useEffect(() => {
    let subscription = null
    let memberStatus = member?.connection_status || 'unknown'
    let isBeingAggregated = member?.is_being_aggregated || false

    if (socketConnection?.webSocketMessages$ && socketConnection.isConnected()) {
      subscription = socketConnection.webSocketMessages$.subscribe(
        (message: { event: string; payload: { [key: string]: unknown } }) => {
          // Only select messages that are relevant for members
          if (message.event.startsWith('member')) {
            switch (message.event) {
              case 'members/priority_data_ready':
                onPriorityDataReady()
                break
              case 'members/updated':
                // Update the member status if it has changed
                if (memberStatus !== message.payload.connection_status) {
                  onMemberStatusUpdate()
                }

                // If member stopped aggregating, the current job just finished
                if (isBeingAggregated && message.payload.is_being_aggregated === false) {
                  onCurrentJobFinished()
                }

                // Keep state up to date
                memberStatus =
                  typeof message?.payload?.connection_status === 'number'
                    ? message.payload.connection_status
                    : memberStatus
                isBeingAggregated =
                  typeof message?.payload?.is_being_aggregated === 'boolean'
                    ? message.payload.is_being_aggregated
                    : isBeingAggregated
                break
            }
          }
        },
      )
    }

    return () => subscription?.unsubscribe()
  }, [])
}
