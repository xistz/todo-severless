import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import cors from '@middy/http-cors'
import { getUserId } from '../utils'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    // TODO: Remove a TODO item by id
    await deleteTodo(todoId, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler.use(cors({ credentials: true }))

const deleteTodo = async (todoId: string, userId: string) => {
  await docClient
    .delete({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      }
    })
    .promise()

  logger.info(`deleted todo todoId: ${todoId}, userId: ${userId}`)
}
