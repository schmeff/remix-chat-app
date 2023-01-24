import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { db } from '../util/db.server'
import { type ActionArgs } from '@remix-run/node'
import Message from '~/components/message'

const socket = io()

interface IMessage {
  id: number
  content: string
  author: string
  likes: number
}

enum MESSAGE_ACTIONS {
  SEND,
  LIKE,
}

export async function loader() {
  return await db.message.findMany()
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  let { _action, ...values } = Object.fromEntries(formData)
  const messageId = +values['messageId'] as number

  switch (_action) {
    case 'send':
      return { message: await createMessage(values as { content: string, author: string }), action: MESSAGE_ACTIONS.SEND }
    case 'like':
      return { message: await likeMessage(messageId, true), action: MESSAGE_ACTIONS.LIKE }
    case 'dislike':
      return { message: await likeMessage(messageId, false), action: MESSAGE_ACTIONS.LIKE }
    default:
      throw new Error(`invalid action type: ${_action}`,)
  }
}

async function likeMessage(messageId: number, liked: boolean) {
  return db.message.update({
    where: {
      id: messageId
    },
    data: {
      likes: {
        increment: liked ? 1 : -1
      }
    }
  })
}

async function createMessage(values: { content: string, author: string }) {
  const content = values['content']
  const author = values['author']

  return await db.message.create({
    data: {
      content,
      author,
    },
  })
}

export default function Index() {
  const [messages, setMessages] = useState(
    useLoaderData<typeof loader>() as IMessage[]
  )
  const [authorInput, setAuthorInput] = useState('')

  const messageData = useActionData<typeof action>() as any

  const formRef = useRef<HTMLFormElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    socket.on('receiveMessage', (receivedMessage: IMessage) => {
      setMessages((prevMessages) => [...prevMessages, receivedMessage])
      scrollToBottom()
    })

    socket.on('updateMessage', (receivedMessage: IMessage) => {
      setMessages(prevMessages => prevMessages.map(m => m.id === receivedMessage.id ? receivedMessage : m))
    })

    return () => {
      socket.off('receiveMessage')
    }
  }, [])

  useEffect(() => {
    if (messageData) {
      switch (messageData.action) {
        case MESSAGE_ACTIONS.SEND:
          formRef.current?.reset()
          messageInputRef.current?.focus()
          socket.emit('message', messageData.message)
          return
        case MESSAGE_ACTIONS.LIKE:
          socket.emit('likeMessage', messageData.message)
          return
        default:
          throw new Error(`Unsupport message data action type: ${messageData.type}`)
      }
    }
  }, [messageData])

  useEffect(() => {
    scrollToBottom()
  }, [])

  function scrollToBottom() {
    setTimeout(() => {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current?.scrollHeight,
        behavior: 'smooth',
      })
    })
  }

  function updateAuthor(event: any) {
    setAuthorInput(event.target.value)
  }

  return (
    <div className='w-5/6 md:w-3/4 mx-auto h-screen flex flex-col dark:bg-gray-900'>
      <div
        className='chat-container border-2 rounded-md border-stone-800 p-2 h-2/3 overflow-y-scroll w-auto no-scrollbar'
        ref={chatContainerRef}
      >
        {messages.map((message: IMessage) => (
          <Message
            key={message.id}
            messageId={message.id}
            content={message.content}
            author={message.author}
            likes={message.likes}
          />
        ))}
      </div>
      <div className='mt-4'>
        <Form method='post' ref={formRef} className='flex flex-col md:flex-row'>
          <input
            required
            type='text'
            name='author'
            className='md:w-40 w-full border-2 border-green-300 focus:border-green-800 focus:border-3 rounded-md focus:outline-none p-1 mr-2 dark:bg-gray-900 dark:text-white dark:border-green-800 dark:focus:border-green-300'
            placeholder='Who are you?'
            value={authorInput}
            onChange={(event) => updateAuthor(event)}
          />
          <div className='flex grow'>
            <input
              type='text'
              required
              name='content'
              ref={messageInputRef}
              className='mt-2 md:mt-0 grow border-2 border-green-300 focus:border-green-800 focus:border-3 rounded-md focus:outline-none p-1 mr-2 dark:bg-gray-900 dark:text-white dark:border-green-800 dark:focus:border-green-300'
              placeholder='Say something...'
            />
            <button
              type='submit'
              className='py-2 px-3 bg-green-800 text-gray-100 rounded-md disabled:bg-gray-400 mt-2 md:mt-0'
              name='_action'
              value='send'
            >
              Send
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}
