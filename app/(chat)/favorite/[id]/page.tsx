import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ToolInvocation } from "ai";

import { auth } from "@/app/(auth)/auth";
import { FavoriteItem as PreviewFavorite } from "@/components/favorite";
import { DEFAULT_MODEL_NAME, models } from "@/lib/ai/models";
import { getFavoritesByUserId } from "@/lib/db/queries";
import type { Message } from "@/lib/db/schema";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  const messagesFromDb = await getFavoritesByUserId({
    id: session.user.id,
  });

  const result = messagesFromDb.find((item) => item.messageId === id);

  if (!result) {
    return notFound();
  }

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("model-id")?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <PreviewFavorite
      id={result.chatId}
      messages={convertToUIMessages(result)}
      selectedModelId={selectedModelId}
    />
  );
}

export function convertToUIMessages(data: any): Array<Message> {
  const chatMessages: Array<Message> = [];

  let textContent = "";
  const toolInvocations: Array<ToolInvocation> = [];

  if (typeof data.message.content === "string") {
    textContent = data.message.content;
  } else if (Array.isArray(data.message.content)) {
    for (const content of data.message.content) {
      if (content.type === "text") {
        textContent += content.text;
      } else if (content.type === "tool-call") {
        toolInvocations.push({
          state: "call",
          toolCallId: content.toolCallId,
          toolName: content.toolName,
          args: content.args,
        });
      }
    }
  }

  const questionContent = data.question ? data.question.content || "" : "";
  chatMessages.push({
    id: data.question?.id,
    role: "user",
    content: questionContent,
    toolInvocations: [],
  });

  chatMessages.push({
    id: data.message.id,
    role: data.message.role as Message["role"],
    content: textContent,
    toolInvocations,
  });

  return chatMessages;
}
