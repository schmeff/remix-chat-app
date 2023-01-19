import { Form, useActionData, useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client'
import { db } from '../util/db.server'
import { type ActionArgs } from '@remix-run/node';

const socket = io()

interface Message {
  id: number,
  content: string,
  author?: string
}

export async function loader() {
  return await db.message.findMany();
}

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  const content = body.get('content');
  const author = body.get('author');

  if (typeof content !== "string" || typeof author !== "string") {
    throw new Error(`Form not submitted correctly.`);
  }

  const message = await db.message.create({
    data: {
      content,
      author
    }
  });
  return message
}

export default function Index() {
  const [messages, setMessages] = useState(useLoaderData<typeof loader>() as Message[])
  const receivedMessage = useActionData<typeof action>() as Message

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    socket.on('receiveMessage', (receivedMessage: Message) => {
      setMessages(prevMessages => [...prevMessages, receivedMessage]);
    })

    return () => {
      socket.off('receiveMessage')
    }
  }, []);

  useEffect(() => {
    if (receivedMessage) {
      formRef.current?.reset();
      socket.emit('message', receivedMessage)
    }
  }, [receivedMessage])

  return (
    <div className='w-1/2 mx-auto h-screen grid place-content-center'>
      <div className='chat-container border-2 rounded-md border-stone-800 p-2 h-96 overflow-y-scroll'>
        {messages.map((message: Message) => <div key={message.id}>{message.content}</div>)}

      </div>
      <div className='mt-4'>
        <Form method='post' ref={formRef}>
          <input required type="text" name='author' className='border-2 border-green-300 focus:border-green-800 focus:border-3 rounded-md focus:outline-none p-1 mr-2' placeholder='Your name here' />
          <input required type="text" name='content' className='border-2 border-green-300 focus:border-green-800 focus:border-3 rounded-md focus:outline-none p-1 mr-2' placeholder='Say something...' />
          <button type='submit' className='py-2 px-3 bg-green-800 text-gray-100 rounded-md disabled:bg-gray-400'>Send</button>
        </Form>
      </div>
    </div>
  );
}
