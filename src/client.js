import WebSocket from 'ws'
import Sequelize from 'sequelize'
import { HTTPClient } from 'bearychat'
import RTMClient from 'bearychat-rtm-client'

import { HUBOT_TOKEN, MYSQL_CONFIG } from './token'

export const sequelize = new Sequelize(
  MYSQL_CONFIG.database,
  MYSQL_CONFIG.username,
  MYSQL_CONFIG.password,
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'dev'
  }
)
sequelize.sync()

export const http = new HTTPClient(HUBOT_TOKEN)

export const rtm = new RTMClient({
  url() {
    return http.rtm.start()
      .then(data => data.ws_host)
  },
  WebSocket,
})

const { RTMClientEvents, RTMClientState } = RTMClient
export { RTMClientEvents, RTMClientState }
