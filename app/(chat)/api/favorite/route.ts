import { auth } from "@/app/(auth)/auth";
import {
  getFavoritesByChatId,
  favoriteMessage,
  getFavoritesByUserId,
} from "@/lib/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");
  const type = searchParams.get("type");

  /* if (!chatId) {
    return new Response("chatId is required", { status: 400 });
  } */

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  let favorites = null;
  switch (type) {
    case "all":
      favorites = await getFavoritesByUserId({ id: session.user.id! });

      if (!favorites) {
        return new Response("Not found", { status: 404 });
      }
      return Response.json(favorites, { status: 200 });

    default:
      favorites = await getFavoritesByChatId({ id: chatId });

      if (!favorites) {
        return new Response("Not found", { status: 404 });
      }

      return Response.json(favorites, { status: 200 });
  }
}

export async function PATCH(request: Request) {
  const {
    chatId,
    messageId,
    questionId,
    isFavorite,
  }: {
    chatId: string;
    messageId: string;
    questionId: string;
    isFavorite: boolean;
  } = await request.json();

  if (!chatId || !messageId) {
    return new Response("messageId and status are required", { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  await favoriteMessage({
    chatId,
    messageId,
    userId: session.user.id,
    isFavorite,
    questionId,
  });

  return new Response("Message favorite", { status: 200 });
}
