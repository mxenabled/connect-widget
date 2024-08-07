export const ActionTypes = {
  // This action triggers an epic which uses the postMessage util.
  // This action takes the following payload using `data` to pass any metadata:
  // {
  //   type: ActionTypes.SEND_POST_MESSAGE,
  //   payload: { event: 'event/nameHere', data: { key: 'value' } },
  // }
  SEND_POST_MESSAGE: "postmessage/connect/send",
};
