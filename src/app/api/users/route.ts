import { createUserSchema } from "@/db/schemas";
import { service } from "@/services";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await service.user.getAllUsers();
    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
  try {
    const body = await req.json();
    const { id, ...updateUser } = body;

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    const updated = await service.user.updateUser(id, updateUser);

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Erro ao atualizar usuário", error);
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

    await service.user.deleteUser(id);
  } catch (error) {
    console.error("Erro ao excluir usuário", error);
    return NextResponse.json(
      { error: "Erro ao excluir usuário" },
      { status: 400 }
    );
  }
}
