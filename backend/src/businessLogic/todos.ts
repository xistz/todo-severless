import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../databaseLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { ImageAccess } from '../storageLayer/imagesAccess'

const todoAccess = new TodoAccess()
const imageAccess = new ImageAccess()
const bucketName = process.env.IMAGES_S3_BUCKET

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return await todoAccess.getAllTodos(userId)
}

export async function createTodo(
  { name, dueDate }: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  return await todoAccess.createTodo({
    todoId,
    userId,
    createdAt: new Date().toISOString(),
    name,
    dueDate,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
  })
}

export async function updateTodo(
  todoId: string,
  userId: string,
  updatedTodo: UpdateTodoRequest
) {
  return await todoAccess.updateTodo(todoId, userId, updatedTodo)
}

export async function deleteTodo(todoId: string, userId: string) {
  return await todoAccess.deleteTodo(todoId, userId)
}

export function generatePresignedUrl(todoId: string) {
  return imageAccess.generatePresignedUrl(todoId)
}
