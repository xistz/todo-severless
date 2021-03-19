import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import cors from '@middy/http-cors'
import { getUserId } from '../utils'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    const userId = getUserId(event)

    const todos = getTodos(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({ todos })
    }
  }
)

handler.use(cors({ credentials: true }))

const getTodos = async (userId: string) => {
  const result = await docClient
    .query({
      TableName: todosTable,
      KeyConditionExpression: 'UserId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

  return result.Items
}
