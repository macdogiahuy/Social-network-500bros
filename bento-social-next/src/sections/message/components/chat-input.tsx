import { sendMessage } from '@/apis/conversation';
import { UploadIcon } from '@/components/icons';
import React, { useState } from 'react';

interface ChatInputProps {
  conversationId: string;
  onMessageSent?: () => void;
}

export default function ChatInput({
  conversationId,
  onMessageSent,
}: ChatInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await sendMessage(conversationId, content.trim());
      setContent('');
      onMessageSent?.();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
      // TODO: Implement file upload
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
          >
            <UploadIcon />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </button>

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="grow text-primary placeholder:text-light placeholder:text-sm placeholder:font-normal bg-transparent"
          />
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="text-primary px-4 py-2 rounded-full hover:bg-neutral4-40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
