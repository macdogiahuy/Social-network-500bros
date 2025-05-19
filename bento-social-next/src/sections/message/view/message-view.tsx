import { getConversations } from '@/apis/conversation';
import useBreakPoint from '@/hooks/use-breakpoint';
import { IConversation } from '@/interfaces/conversation';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import EmptyContent from '@/components/empty-content/empty-content';
import { Typography } from '@/components/typography';
import { ConversationSidebar } from '../components';
import ConversationDetail from '../components/conversation-detail';

export default function MessageView() {
  const { breakpoint } = useBreakPoint();
  const searchParams = useSearchParams();
  const [showDetailOnly, setShowDetailOnly] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<IConversation | null>(null);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isMobile = breakpoint === 'sm';
  const hideConsolidation = breakpoint === 'sm' || breakpoint === 'md';

  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      const fetchConversations = async () => {
        try {
          setIsLoading(true);
          const response = await getConversations();
          setConversations(response.data);
          const conversation = response.data.find(
            (c) => c.id === conversationId,
          );
          if (conversation) {
            setSelectedConversation(conversation);
            if (isMobile) {
              setShowDetailOnly(true);
            }
          }
        } catch (error) {
          console.error('Error fetching conversations:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchConversations();
    }
  }, [searchParams, isMobile]);

  const handleConversationClick = (conversation: IConversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowDetailOnly(true);
    }
  };

  const handleBack = () => {
    setShowDetailOnly(false);
    setSelectedConversation(null);
  };

  return (
    <section className="w-full h-full flex flex-col justify-start transition-all duration-[0.5s] lg:flex-row lg:items-start">
      {!isMobile || !showDetailOnly ? (
        <ConversationSidebar
          onConversationClick={handleConversationClick}
          selectedConversationId={selectedConversation?.id}
        />
      ) : null}

      {!hideConsolidation ? (
        <section className="bg-surface h-screen w-full grow flex flex-col justify-center items-center gap-3 py-[1.75rem]">
          {selectedConversation ? (
            <ConversationDetail
              conversation={selectedConversation}
              onBack={handleBack}
            />
          ) : (
            <EmptyContent
              content={
                <Typography level="base2sm" className="text-secondary">
                  Select conversation to start messaging
                </Typography>
              }
              image="/svg/ai_data_consolidation.svg"
            />
          )}
        </section>
      ) : selectedConversation ? (
        <ConversationDetail
          conversation={selectedConversation}
          onBack={handleBack}
        />
      ) : null}
    </section>
  );
}
