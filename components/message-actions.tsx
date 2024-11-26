import type { Message } from 'ai';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';
import { Tooltip } from '@radix-ui/react-tooltip';

import type { Favorite, Vote } from '@/lib/db/schema';
import {
  getMessageIdFromAnnotations,
  getQuestionIdFromAnnotations,
} from '@/lib/utils';

import {
  CopyIcon,
  StarIcon,
  StarOutlinedIcon,
  ThumbDownIcon,
  ThumbUpIcon,
} from './icons';
import { Button } from './ui/button';

export function MessageActions({
  chatId,
  message,
  questionId,
  vote,
  favorite,
  isLoading,
}: {
  chatId: string;
  questionId: string;
  message: Message;
  vote: Vote | undefined;
  favorite: Favorite | undefined;
  isLoading: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();

  if (isLoading) return null;
  if (message.role === 'user') return null;
  if (message.toolInvocations && message.toolInvocations.length > 0)
    return null;

  return (
    <div>
      <Tooltip content="Copy">
        <Button
          className="py-1 px-2 h-fit text-muted-foreground"
          variant="outline"
          onClick={async () => {
            await copyToClipboard(message.content as string);
            toast.success('Copied to clipboard!');
          }}
        >
          <CopyIcon />
        </Button>
      </Tooltip>
      <Tooltip content="Upvote Response">
        <Button
          className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
          disabled={vote?.isUpvoted}
          variant="outline"
          onClick={async () => {
            const messageId = getMessageIdFromAnnotations(message);

            const upvote = fetch('/api/vote', {
              method: 'PATCH',
              body: JSON.stringify({
                chatId,
                messageId,
                type: 'up',
              }),
            });

            toast.promise(upvote, {
              loading: 'Upvoting Response...',
              success: () => {
                mutate<Array<Vote>>(
                  `/api/vote?chatId=${chatId}`,
                  (currentVotes) => {
                    if (!currentVotes) return [];

                    const votesWithoutCurrent = currentVotes.filter(
                      (vote) => vote.messageId !== message.id,
                    );

                    return [
                      ...votesWithoutCurrent,
                      {
                        chatId,
                        messageId: message.id,
                        isUpvoted: true,
                      },
                    ];
                  },
                  { revalidate: false },
                );

                return 'Upvoted Response!';
              },
              error: 'Failed to upvote response.',
            });
          }}
        >
          <ThumbUpIcon />
        </Button>
      </Tooltip>

      <Tooltip content="Downvote Response">
        <Button
          className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
          variant="outline"
          disabled={vote && !vote.isUpvoted}
          onClick={async () => {
            const messageId = getMessageIdFromAnnotations(message);

            const downvote = fetch('/api/vote', {
              method: 'PATCH',
              body: JSON.stringify({
                chatId,
                messageId,
                type: 'down',
              }),
            });

            toast.promise(downvote, {
              loading: 'Downvoting Response...',
              success: () => {
                mutate<Array<Vote>>(
                  `/api/vote?chatId=${chatId}`,
                  (currentVotes) => {
                    if (!currentVotes) return [];

                    const votesWithoutCurrent = currentVotes.filter(
                      (vote) => vote.messageId !== message.id,
                    );

                    return [
                      ...votesWithoutCurrent,
                      {
                        chatId,
                        messageId: message.id,
                        isUpvoted: false,
                      },
                    ];
                  },
                  { revalidate: false },
                );

                return 'Downvoted Response!';
              },
              error: 'Failed to downvote response.',
            });
          }}
        >
          <ThumbDownIcon />
        </Button>
      </Tooltip>

      <Tooltip content="Favorite">
        <Button
          className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
          variant="outline"
          onClick={async () => {
            const messageId = getMessageIdFromAnnotations(message);
            const questionIdAnnotation = getQuestionIdFromAnnotations(message);

            const isFavorite = fetch('/api/favorite', {
              method: 'PATCH',
              body: JSON.stringify({
                chatId,
                messageId,
                questionId: questionIdAnnotation || questionId,
                isFavorite: true,
              }),
            });

            toast.promise(isFavorite, {
              loading: favorite?.isFavorite ? 'Unfavorite...' : 'Favorite...',
              success: () => {
                mutate<Array<Favorite>>(
                  `/api/favorite?chatId=${chatId}`,
                  (currentFavorites: Favorite) => {
                    if (!currentFavorites) return [];

                    const favoritesWithoutCurrent = currentFavorites.filter(
                      (favorite: Favorite) => favorite.messageId !== message.id,
                    );

                    return [
                      ...favoritesWithoutCurrent,
                      {
                        chatId,
                        messageId: message.id,
                        questionId: questionId,
                        isFavorite: !favorite?.isFavorite,
                      },
                    ];
                  },
                  { revalidate: false },
                );

                mutate<Array<Favorite>>(`/api/favorite?type=all`, {
                  revalidate: false,
                });

                return favorite?.isFavorite ? 'Unfavorite!' : 'Favorite!';
              },
              error: 'Failed to favorite.',
            });
          }}
        >
          {favorite?.isFavorite ? <StarIcon /> : <StarOutlinedIcon />}
        </Button>
      </Tooltip>
    </div>
  );
}
