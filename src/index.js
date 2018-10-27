import 'babel-polyfill'

import * as clients from './client'
import { commands } from './apps/commands'
import { RTMLogger } from './apps/logger'

commands(clients)

if (process.env.NODE_ENV === 'dev') {
  RTMLogger(clients)
}
