<<<<<<< HEAD
import React from 'react';

import { UploadIcon } from '@/components/icons';

//-------------------------------------------------------------------------

function handelSubmitMessage() {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputElement = e.currentTarget.querySelector('input');
    const message = inputElement ? inputElement.value : '';
    console.log(message);
  };
}

export default function ChatInput() {
=======
'use client';

import React from 'react';

import { sendMessage, IChatMessage } from '@/apis/conversation';

import { UploadIcon } from '@/components/icons';

//-------------------------------------------------------------------------

interface ChatInputProps {
  roomId: string;
  onMessageSent?: (message: IChatMessage) => void;
}

export default function ChatInput({ roomId, onMessageSent }: ChatInputProps) {
>>>>>>> origin/refactor-post
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [content, setContent] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

<<<<<<< HEAD
=======
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    try {
      setIsSending(true);
      const result = await sendMessage(roomId, { content: content.trim() });
      if (result.data && onMessageSent) {
        onMessageSent(result.data);
      }
      setContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

>>>>>>> origin/refactor-post
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

<<<<<<< HEAD
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
    }
  };
  return (
    <div className="w-full p-3">
      <form onSubmit={handelSubmitMessage()}>
=======
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsSending(true);
      const result = await sendMessage(roomId, {}, file);
      if (result.data && onMessageSent) {
        onMessageSent(result.data);
      }
    } catch (error) {
      console.error('Failed to send file:', error);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full p-3">
      <form onSubmit={handleSubmit}>
>>>>>>> origin/refactor-post
        <div className="flex items-center gap-4 p-2.5 rounded-[2.625rem] bg-neutral4-30">
          <button
            className="btn-upload p-[0.4375rem] group"
            onClick={handleButtonClick}
            disabled={isSending}
          >
            <UploadIcon />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
<<<<<<< HEAD
              accept="image/*"
=======
              accept="image/*,video/*"
>>>>>>> origin/refactor-post
              className="hidden"
            />
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            className="grow text-primary placeholder:text-light placeholder:text-sm placeholder:font-normal bg-transparent"
<<<<<<< HEAD
=======
            disabled={isSending}
>>>>>>> origin/refactor-post
          />
          <button type="submit" className="hidden"></button>
        </div>
      </form>
    </div>
  );
}
