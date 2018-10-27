/* eslint-disable no-console */
export const RTMLogger = clients => {
  const { rtm, RTMClientEvents: Events } = clients

  function handleOnline() {
    console.log('====================================')
    console.log('ONLINE')
    console.log('====================================\n\n')
  }

  function handleOffline() {
    console.log('====================================')
    console.log('OFFLINE')
    console.log('====================================\n\n')
  }

  function handleRTMEvent(message) {
    console.log('====================================')
    console.log('EVENT MESSAGE RECEIVED:')
    console.log('========')
    console.log(JSON.stringify(message))
    console.log('====================================\n\n')
  }

  function handleError(errorEvent) {
    console.log('====================================')
    console.log('ERROR')
    console.log('=========')
    console.error(JSON.stringify(errorEvent))
    console.log('====================================\n\n')
  }

  rtm.on(Events.ONLINE, handleOnline)
  rtm.on(Events.OFFLINE, handleOffline)
  rtm.on(Events.EVENT, handleRTMEvent)
  rtm.on(Events.ERROR, handleError)
}
