import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly logger = (logGroup: string) => createLogger(logGroup),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosUserIndex = process.env.TODOS_USER_INDEX
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    this.logger('getTodos').info('Getting all todos')

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosUserIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    this.logger('createTodo').info('Creating todo')

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async updateTodo(
    todoId: string,
    userId: string,
    { name, dueDate, done }: TodoUpdate
  ) {
    this.logger('updateTodo').info('Updating todo')

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': name,
          ':dueDate': dueDate,
          ':done': done
        },
        ReturnValues: 'ALL_NEW'
      })
      .promise()
  }

  async deleteTodo(todoId: string, userId: string) {
    this.logger('deleteTodo').info('Deleting todo')

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
