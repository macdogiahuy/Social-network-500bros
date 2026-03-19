import { sendMessage } from '@/apis/conversation';
import { CloseIcon, UploadIcon } from '@/components/icons';
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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!content.trim() && !file) || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await sendMessage(conversationId, content.trim(), file as File);
      setContent('');
      handleRemoveFile();
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
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full p-3 flex flex-col gap-2">
      {file && (
        <div className="relative self-start p-2 bg-neutral4-30 rounded-xl">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-20 w-auto rounded-lg object-cover"
            />
          ) : (
            <div className="flex items-center gap-2 p-2 bg-neutral-800 rounded-lg">
              <UploadIcon />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white max-w-[200px] truncate">
                  {file.name}
                </span>
                <span className="text-xs text-secondary">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleRemoveFile}
            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <CloseIcon />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full">
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
              className="hidden"
            />
          </button>

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="grow text-primary placeholder:text-light placeholder:text-sm placeholder:font-normal bg-transparent outline-none"
          />
          <button
            type="submit"
            disabled={(!content.trim() && !file) || isSubmitting}
            className="text-primary px-4 py-2 rounded-full hover:bg-neutral4-40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium border border-transparent active:scale-95"
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
