import prisma from "@/lib/db";
import { endGameSchema } from "@/schemas/questions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();
    const { gameId } = endGameSchema.parse(body);

    const game = await prisma.game.findUnique({
      where: {
        id: gameId
      }
    });
    if (!game) {
      return NextResponse.json(
        {
          message: "Game not found"
        },
        {
          status: 404
        }
      );
    }
    await prisma.game.update({
      where: {
        id: gameId
      },
      data: {
        timeEnded: new Date()
      }
    });
    return NextResponse.json(
      {
        message: "Game is finished :)"
      },
      {
        status: 200
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong"
      },
      { status: 500 }
    );
  }
}
