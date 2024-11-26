"use client";

import { useState } from "react";
import useSWR from "swr";
import { useWindowSize } from "usehooks-ts";

import { ChatHeader } from "@/components/chat-header";
import { PreviewMessage } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import type { Favorite, Vote } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";

import type { UIBlock } from "./block";

export function FavoriteItem({
  id,
  messages,
  selectedModelId,
}: {
  id: string;
  messages: Array<Favorite>;
  selectedModelId: string;
}) {
  const { width: windowWidth = 1920, height: windowHeight = 1080 } =
    useWindowSize();

  const [block, setBlock] = useState<UIBlock>({
    documentId: "init",
    content: "",
    title: "",
    status: "idle",
    isVisible: false,
    boundingBox: {
      top: windowHeight / 4,
      left: windowWidth / 4,
      width: 250,
      height: 50,
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher
  );

  const { data: favorites } = useSWR<Array<Favorite>>(
    `/api/favorite?chatId=${id}`,
    fetcher
  );

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader selectedModelId={selectedModelId} disabled={true} />
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >
          {messages.map((message) => {
            return (
              <PreviewMessage
                key={message.id}
                chatId={id}
                message={message}
                messages={messages}
                block={block}
                setBlock={setBlock}
                isLoading={false}
                vote={
                  votes
                    ? votes.find((vote: Vote) => vote.messageId === message.id)
                    : undefined
                }
                favorite={
                  favorites
                    ? favorites.find(
                        (favorite: Favorite) =>
                          favorite.messageId === message.id
                      )
                    : undefined
                }
              />
            );
          })}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
      </div>
    </>
  );
}
