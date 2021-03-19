import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import cors from '@middy/http-cors'
import { getUserId } from '../utils'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'

const logger = createLogger('getTodos')

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todosUserIndex = process.env.TODOS_USER_INDEX

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    const userId = getUserId(event)

    const todos = await getTodos(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({ items: todos })
    }
  }
)

handler.use(cors({ credentials: true }))

const getTodos = async (userId: string) => {
  const result = await docClient
    .query({
      TableName: todosTable,
      IndexName: todosUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

  logger.info('got todos')

  return result.Items as TodoItem[]
}
