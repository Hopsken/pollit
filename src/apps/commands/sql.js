import * as db from '../../scheme'
import { sequelize } from '../../client'

/*
  * 生成新投票
*/
export const createPoll = ({
  teamId,
  creatorId,
  text,
  anonymous,
  multi
} = {}) =>
  db.Poll.create({
    teamId,
    creatorId,
    text,
    anonymous,
    multi
  })

/*
  * 根据 ID 更新投票
*/
export const updatePollById = (pollId, attributes) => {

  if (!Number.isSafeInteger(pollId - 0)) {
    return Promise.reject('Invalid pollId')
  }

  return db.Poll.update(
    attributes,
    { where: { id: pollId } }
  )
}

/*
  * 根据 ID 查找投票
  * params: pollId, keys: Array<String>
*/
export const getPoll = async (conditions, keys) => {

  if (conditions['id'] && !Number.isSafeInteger(conditions['id'] - 0)) {
    return Promise.reject('Invalid pollId')
  }

  const poll = await db.Poll.findOne({
    attributes: keys,
    where: conditions
  })

  return new Promise((resolve, reject) => {
    if (poll) {
      resolve(poll.get({ plain: true }))
    } else {
      reject(null)
    }
  }
  )
}

/*
  * 创建多个 Answer
*/

export const createBulkAnswer = async ({
  pollId,
  userId,
  choiceIds,
}) => {

  const exists = await db.Answer.findOne({
    where: {
      pollId,
      userId
    }
  })

  if (exists) {
    throw new Error(401)
  }

  ;(choiceIds || []).map(async choiceId => await createAnswer({
    pollId,
    userId,
    choiceId,
  }).catch(() => null)
  )

  return db.Answer.findAll({
    where: {
      pollId,
      userId
    }
  })
}
/*
  * 创建用户 Answer
*/
export const createAnswer = ({
  pollId, userId, choiceId
} = {}) => {
  return db.Answer.findOne({
    where: {
      pollId,
      userId
    }
  })
    .then(ans => {
      if (ans) {
        throw new Error('Aleady Exist.')
      } else {
        return db.Answer.create({
          pollId,
          userId,
          choiceId,
        })
      }
    })
}


/*
  * 批量创建 Choices 选项
*/
export const createBulkChoices = (
  choices,
  pollId
) =>
  db.Choice.bulkCreate(choices.map((one, index) => ({
    pollId,
    index: index + 1,
    text: one
  })))

/*
  * 根据 pollId 查找选项
*/
export const getChoicesByPollId = async (pollId, keys) => {

  if (!Number.isSafeInteger(pollId - 0)) {
    return Promise.reject('Invalid pollId')
  }

  const choices = await db.Choice.findAll({
    attributes: keys,
    where: {
      pollId
    },
    order: [
      ['index', 'ASC']
    ]
  })

  return new Promise((resolve, reject) => {
    const plainChoices = (choices || []).map(one => one.get({ plain: true }))

    if (plainChoices) {
      resolve(plainChoices)
    } else {
      reject(null)
    }
  })
}

/*
  * 查询指定 pollId 的投票情况
  * result: Object<detail: Array, total: number>
*/
export const getStatsByPollId = async pollId => {

  if (!Number.isSafeInteger(pollId - 0)) {
    return Promise.reject('Invalid pollId')
  }

  const answers = await sequelize.query('SELECT answers.userId, choices.index, choices.text FROM answers, choices \
   WHERE answers.choiceId = choices.id AND answers.pollId = :pollId',
  {
    replacements: { pollId },
    type: sequelize.QueryTypes.SELECT
  }
  )
  const choices = await getChoicesByPollId(pollId)
  const formated = [] // Array<{ text: string, users: Array }>

  choices.forEach(choice => {
    formated.push({
      text: choice.text,
      users: []
    })
  })

  answers.forEach(answer => {
    formated[answer.index - 1]['users'].push(answer.userId)
  })

  return {
    detail: formated,
    total: answers.length
  }
}
