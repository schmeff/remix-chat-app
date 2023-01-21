import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { db } from '../util/db.server';
import { type ActionArgs } from '@remix-run/node';
import Message from '~/components/message';

const socket = io();

interface IMessage {
  id: number,
  content: string,
  author: string
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
  return message;
}

export default function Index() {
  const [messages, setMessages] = useState(useLoaderData<typeof loader>() as IMessage[]);
  const [authorInput, setAuthorInput] = useState('');

  const receivedMessage = useActionData<typeof action>() as IMessage;

  const formRef = useRef<HTMLFormElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.on('receiveMessage', (receivedMessage: IMessage) => {
      setMessages(prevMessages => [...prevMessages, receivedMessage]);
    })

    return () => {
      socket.off('receiveMessage');
    }
  }, []);

  useEffect(() => {
    if (receivedMessage) {
      formRef.current?.reset();
      messageInputRef.current?.focus();
      socket.emit('message', receivedMessage);
    }
  }, [receivedMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages])

  function scrollToBottom() {
    setTimeout(() => {
      chatContainerRef.current?.scrollTo({ top: chatContainerRef.current?.scrollHeight, behavior: 'smooth' });
    });
  }

  function updateAuthor(event: any) {
    // localStorage.setItem('author', event.target.value);
    setAuthorInput(event.target.value);
  }

  return (
    <div className='w-5/6 md:w-3/4 mx-auto h-screen flex flex-col dark:bg-gray-900'>
      <div className='chat-container border-2 rounded-md border-stone-800 p-2 h-2/3 overflow-y-scroll min-w-max no-scrollbar' ref={chatContainerRef}>
        {messages.map((message: IMessage) => <Message key={message.id} messageId={message.id} content={message.content} author={message.author} />)}
      </div>
      <div className='mt-4'>
        <Form method='post' ref={formRef} className='flex flex-col md:flex-row'>
          <input required type="text" name='author' className='md:w-40 w-full border-2 border-green-300 focus:border-green-800 focus:border-3 rounded-md focus:outline-none p-1 mr-2 dark:bg-gray-900 dark:text-white dark:border-green-800 dark:focus:border-green-300' placeholder='Who are you?' value={authorInput} onChange={(event) => updateAuthor(event)} />
          <div className='flex grow'>
            <input type="text" required name='content' ref={messageInputRef} className='mt-2 md:mt-0 grow border-2 border-green-300 focus:border-green-800 focus:border-3 rounded-md focus:outline-none p-1 mr-2 dark:bg-gray-900 dark:text-white dark:border-green-800 dark:focus:border-green-300' placeholder='Say something...' />
            <button type='submit' className='py-2 px-3 bg-green-800 text-gray-100 rounded-md disabled:bg-gray-400 mt-2 md:mt-0'>Send</button>
          </div>
        </Form>
      </div>
    </div>
  );
}
