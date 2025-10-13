import { NextResponse } from "next/server";
import { db } from "../../../db/db";
import { users } from "../../../db/schemas/users.schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const userSchema = z.object({
  email: z.string(),
  password: z.string(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export async function GET() {
  try {
    const user = await db.select().from(users);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário");
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = userSchema.parse(body);
    const preparedData = {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };

    const newUser = await db.insert(users).values(preparedData).returning();
    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário");
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateUser } = body;

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    const updated = await db
      .update(users)
      .set(updateUser)
      .where(eq(users.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Erro ao atualizar usuário");
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    await db.delete(users).where(eq(users.id, id));
  } catch (error) {
    console.error("Erro ao excluir usuário");
    return NextResponse.json(
      { error: "Erro ao excluir usuário" },
      { status: 400 }
    );
  }
}
