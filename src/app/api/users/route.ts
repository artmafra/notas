import { createUserSchema } from "@/db/schemas";
import { service } from "@/services";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/helper";
import { ratelimit } from "@/lib/ratelimit";

export async function GET(req: Request) {
  await requireSession();

  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: "Rate Limit exceeded" }, { status: 429 });
  }

  try {
    const user = await service.user.getAllUsers();
    return NextResponse.json(user);
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status });
  }
}

export async function POST(req: Request) {
  await requireSession();

  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: "Rate Limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const data = createUserSchema.parse(body);

    const newUser = await service.user.createUser(data);
    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  await requireSession();

  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: "Rate Limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { id, ...updateUser } = body;

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    const updated = await service.user.updateUser(id, updateUser);

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status }
    );
  }
}

export async function DELETE(req: Request) {
  await requireSession();

  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: "Rate Limit exceeded" }, { status: 429 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    await service.user.deleteUser(id);
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status });
  }
}
