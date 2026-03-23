import { useEffect } from 'react'
import { useWebSocketContext } from 'src/context/WebSocketContext'

export const useConnectingStream = ({
  member,
  onTimeout,
  onMemberStatusUpdate,
  onPriorityDataReady,
  onCurrentJobFinished,
  onMemberFullyConnected,
}: {
  member: any
  onTimeout: () => void
  onMemberStatusUpdate: () => void
  onPriorityDataReady: () => void
  onCurrentJobFinished: () => void
  onMemberFullyConnected: () => void
}) => {
  // Set up websocket connection
  const socketConnection = useWebSocketContext()

  useEffect(() => {
    let subscription = null
    let memberStatus = member?.connection_status || 'unknown'
    let isBeingAggregated = member?.is_being_aggregated || false

    if (socketConnection?.webSocketMessages$ && socketConnection.isConnected()) {
      subscription = socketConnection.webSocketMessages$.subscribe(
        (message: { event: string; payload: any }) => {
          // Only select messages that are relevant for members
          if (message.event.startsWith('member')) {
            switch (message.event) {
              case 'members/priority_data_ready':
                onPriorityDataReady()
                break
              case 'members/updated':
                // Update the member status if it has changed
                if (memberStatus !== message.payload.connection_status) {
                  console.log(memberStatus + ' -> ' + message.payload.connection_status)
                  onMemberStatusUpdate()
                }

                // If member stopped aggregating, the current job just finished
                if (isBeingAggregated && message.payload.is_being_aggregated === false) {
                  onCurrentJobFinished()
                }

                // Keep state up to date
                memberStatus = message.payload.connection_status
                isBeingAggregated = message.payload.is_being_aggregated
                break
            }
          }
        },
      )
    }

    return () => subscription?.unsubscribe()
  }, [])
}
