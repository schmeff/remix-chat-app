import { useState } from 'react'
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa'
import { Form } from "@remix-run/react";

export default function Message({
  messageId,
  content,
  author,
  likes
}: {
  messageId: number
  content: string
  author: string,
  likes: number
}) {
  const [showMessageActions, setShowMessageActions] = useState(false)

  return (
    <div
      className='bg-gray-300 dark:bg-gray-700 w-fit py-1 px-2 my-3 rounded-md relative'
      onMouseEnter={() => setShowMessageActions(true)}
      onMouseLeave={() => setShowMessageActions(false)}
    >
      {showMessageActions && (
        <div className='bg-gray-300 dark:bg-gray-700 border-2 rounded-md p-1 absolute dark:border-gray-900 -bottom-8 flex gap-2 z-10' >
          <Form method='post'>
            <input type='hidden' name='messageId' value={messageId} />
            <button
              type='submit'
              className='-right-0.5 top-0.5'
              value='like'
              name='_action'
            >
              <FaThumbsUp className='text-yellow-300 text-lg' />
            </button>
          </Form>
          <Form method='post'>
            <input type='hidden' name='messageId' value={messageId} />
            <button
              type='submit'
              className='-right-0.5 top-0.5'
              value='dislike'
              name='_action'
            >
              <FaThumbsDown className='text-yellow-300 text-lg' />
            </button>
          </Form>
        </div>
      )}
      <p className='dark:text-white text-xs'>{author}</p>
      <p className='break-words dark:text-white' key={messageId}>
        {content}
      </p>
      <p className='flex my-1 gap-2'>
        {likes > 0 && <FaThumbsUp className='text-yellow-300 text-sm' />}
        {likes < 0 && <FaThumbsDown className='text-yellow-300 text-sm' />}
        {likes !== 0 ? <p className='text-white text-sm'>{likes}</p> : null}
      </p>
    </div>
  )
}
