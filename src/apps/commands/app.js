import { parseCmd } from './utils'
import { INTRODUCTION_TEMPLATE } from '../../templates'
import { personalCommandHandlers, channelCommandHandlers } from './commandHandlers'

export const commands = async clients => {
  const { rtm, http, RTMClientEvents: Events } = clients

  const me = await http.user.me()

  function handleCommand(message, reply) {
    // 解析命令
    let cmd = '', options = []
    try {
      [cmd, ...options] = parseCmd(message.text)
    } catch (err) {
      // 解析出错时报错
      reply({
        text: err.message
      })
      return
    }

    const handler = personalCommandHandlers[cmd]

    if (typeof handler === 'function') {
      handler.call(message, options, reply, http)
    } else {
      reply({
        text: INTRODUCTION_TEMPLATE
      })
    }
  }

  function handleP2PMessage(message) {
    if (message.uid === me.id) {
      // prevent inifinite message loop
      return
    }

    const reply = others =>
      http.message.create({
        vchannel_id: message.vchannel_id,
        attachments: [],
        text: 'Aha, gocha~',
        ...others,
      })

    handleCommand(message, reply)
  }

  function handleChannelMessage(message) {
    if (message.uid === me.id) {
      // prevent inifinite message loop
      return
    }

    const reply = others =>
      http.message.create({
        vchannel_id: message.vchannel_id,
        attachments: [],
        text: 'Aha, gocha~',
        ...others,
      })

    if (message['refer_key']) {
      channelCommandHandlers['refer'].call(message, reply, http)
    }
    return
  }

  function handleRTMEvent(message) {
    switch (message.type) {
    case 'message':
      handleP2PMessage(message)
      break
    case 'channel_message':
      handleChannelMessage(message)
      break
    default:
    }
  }

  rtm.on(Events.EVENT, handleRTMEvent)
}
