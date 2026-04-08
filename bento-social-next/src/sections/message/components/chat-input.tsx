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
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [content, setContent] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

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

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

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
        <div className="flex items-center gap-4 p-2.5 rounded-[2.625rem] bg-neutral4-30">
          <button
            type="button"
            className="btn-upload p-[0.4375rem] group"
            onClick={handleButtonClick}
            disabled={isSending}
          >
            <UploadIcon />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
          </button>

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="grow text-primary placeholder:text-light placeholder:text-sm placeholder:font-normal bg-transparent"
            disabled={isSending}
          />
          <button type="submit" className="hidden"></button>
        </div>
      </form>
    </div>
  );
}
