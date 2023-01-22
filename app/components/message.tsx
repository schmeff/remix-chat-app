import { Form } from "@remix-run/react";
import { useState } from "react"
import { FaPoop, FaSmile, FaFrown, FaLaugh } from "react-icons/fa"

interface Emoji {
  name: string,
  color: string
}

export default function Message({ messageId, content, author }: { messageId: number, content: string, author: string }) {
  const [showMessageActions, setShowMessageActions] = useState(false);

  return (
    <div className='bg-gray-300 dark:bg-gray-700 w-fit py-1 px-2 m-1 rounded-md relative' onMouseEnter={() => setShowMessageActions(true)} onMouseLeave={() => setShowMessageActions(false)}>
      {showMessageActions && <Form className="bg-gray-300 dark:bg-gray-700 border-2 rounded-md p-1 absolute dark:border-gray-900 -bottom-5 flex gap-1 z-10">
        <input type="hidden" name="messageId" value={messageId} />
        <button type="submit" data-action="smileReaction" className=' -right-0.5 top-0.5' value="smile"><FaSmile className="text-yellow-300 text-lg" /></button>
        <button type="submit" data-action="frownReaction" className=' -right-0.5 top-0.5' value="frown"><FaFrown className="text-yellow-300 text-lg" /></button>
        <button type="submit" data-action="laughtReaction" className=' -right-0.5 top-0.5' value="laugh"><FaLaugh className="text-yellow-300 text-lg" /></button>
        <button type="submit" data-action="poopReaction" className=' -right-0.5 top-0.5' value="poop"><FaPoop className="text-yellow-900 text-lg" /></button>
      </Form>}
      <p className='dark:text-white text-xs'>{author}</p>
      <p className='break-words dark:text-white' key={messageId}>{content}</p>
    </div>
  )
}