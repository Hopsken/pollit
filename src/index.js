import 'babel-polyfill'

import * as clients from './client'
import { commands } from './apps/commands'

commands(clients)

if (process.env.NODE_ENV === 'dev') {
  import { RTMLogger } from './apps/logger'
  RTMLogger(clients)
}
