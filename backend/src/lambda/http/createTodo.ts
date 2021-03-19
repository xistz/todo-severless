import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import cors from '@middy/http-cors'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'
import { v4 as uuidv4 } from 'uuid'
import { TodoItem } from '../../models/TodoItem'
import { getUserId } from '../utils'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const logger = createLogger('createTodo')

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const parsedBody: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    // TODO: Implement creating a new TODO item
    const newTodo = await createTodo(
      parsedBody.name,
      parsedBody.dueDate,
      userId
    )

    return {
      statusCode: 201,
      body: JSON.stringify(newTodo)
    }
  }
)

handler.use(cors({ credentials: true }))

const createTodo = async (name: string, dueDate: string, userId: string) => {
  const todoId: string = uuidv4()

  const newTodo: TodoItem = {
    todoId,
    userId,
    createdAt: new Date().toISOString(),
    name,
    dueDate,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
  }

  await docClient
    .put({
      TableName: todosTable,
      Item: newTodo
    })
    .promise()

  logger.info('created new todo', newTodo)

  return newTodo
}
