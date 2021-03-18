import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import cors from '@middy/http-cors'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { TodoItem } from '../../models/TodoItem'
import { getUserId } from '../utils'

const docClient = new DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const parsedBody: CreateTodoRequest = JSON.parse(event.body)

    // TODO: Implement creating a new TODO item
    const todoId: string = uuidv4()
    const userId = getUserId(event)

    const newTodo: TodoItem = {
      todoId,
      userId,
      createdAt: new Date().toISOString(),
      ...parsedBody,
      done: false,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
    }

    await docClient
      .put({
        TableName: todosTable,
        Item: newTodo
      })
      .promise()

    return {
      statusCode: 201,
      body: JSON.stringify(newTodo)
    }
  }
)

handler.use(cors({ credentials: true }))
