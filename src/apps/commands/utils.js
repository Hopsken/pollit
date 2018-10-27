import { getStatsByPollId } from './sql'

const choiceEmojis = {
  0: '0️⃣', 1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣',
  6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣', 10: '🔟', other: '#️⃣'
}

function parsePollCmd(text) {
  try {
    return text.trim().slice(4)
      .trim()
      .match(/["“][^"“”]+["”]/g)
      .map(one => one.slice(1, -1))
  } catch(err) {
    throw new Error('格式错误，请输入 `help` 查看使用说明。')
  }
}

function parsePublishCmd(text) {
  text = text.trim()

  try {
    let [, pollId] = text.split(/\s+/)
    let rest = /^publish\s+\d+\s+["“]?(.+)["”]?$/.exec(text)[1]
    rest = rest.trim().replace(/["“”]/g, '')

    return [pollId, rest]
  } catch(err) {
    throw new Error('格式错误，输入 `publish 编号 "讨论组名"` 以发布投票到指定讨论组。')
  }
}

export const parseCmd = text => {
  let [cmd, ...rest] = text.trim().split(/\s+/)
  cmd = cmd.toLowerCase()

  try {
    if (cmd === 'poll') {
      rest = parsePollCmd(text)
    }

    if (cmd === 'publish') {
      rest = parsePublishCmd(text)
    }
  } catch(err) {
    throw new Error('格式错误，输入 `help` 查看使用说明。')
  }

  return [cmd, ...rest]
}


export const formatChoices = (choices, names) => {
  let res = ''
  names = names || [];

  (choices || []).forEach((one, i) => {
    const index = i + 1
    res += `${ index <= 10 ? choiceEmojis[index] : index } ${one} \n`
    if (names[index] && names[index].length) {
      res += `${names[index].length} 人：` + names[index].map(name => `@<=${name}=>`).join(' ') + '\n'
    }
  })

  // 移除最后一个换行
  return res.slice(0, -1)
}


export const getUserIdsWithIndexByPollId = async (pollId) => {
  const answers = await getStatsByPollId(pollId)
  const userIdsByIndex = []

  answers.forEach(answer => {
    let ids = userIdsByIndex[answer.index]
    if (!ids) {
      ids = [answer.userId]
    } else {
      ids.push(answer.userId)
    }

    userIdsByIndex[answer.index] = ids
  })

  return userIdsByIndex
}


export const getCurrentBotName = async (http) => {
  const currentBot = await http.user.me()

  return currentBot.full_name || currentBot.name
}
