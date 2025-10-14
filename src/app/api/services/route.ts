import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { storage } from "@/storage";
import { insertServiceSchema, services } from "@/db/schemas";

export async function GET() {
  try {
    const service = await storage.service.getAllServices();
    return NextResponse.json(service);
  } catch (error) {
    console.error("Erro ao buscar serviço");
    return NextResponse.json(
      { error: "Erro ao buscar serviço" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = insertServiceSchema.parse(body);

    const newService = await storage.service.createService(data);
    return NextResponse.json(newService[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar serviço");
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    const updated = await storage.service.updateService(id, data);

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Erro ao atualizar serviço");
    return NextResponse.json(
      { error: "Erro ao atualizar serviço" },
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

    await storage.service.deleteService(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir serviço");
    return NextResponse.json(
      { error: "Erro ao excluir serviço" },
      { status: 400 }
    );
  }
}
