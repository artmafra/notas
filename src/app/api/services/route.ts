import { NextResponse } from "next/server";
import { insertServiceSchema } from "@/db/schemas";
import { storage } from "@/storage";
import { requireSession } from "@/lib/helper";

export async function GET() {
  await requireSession();
  try {
    const service = await storage.service.getAllServices();
    return NextResponse.json(service);
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: "Erro ao buscar serviço" }, { status });
  }
}

export async function POST(req: Request) {
  await requireSession();
  try {
    const body = await req.json();
    const data = insertServiceSchema.parse(body);

    const newService = await storage.service.createService(data);
    return NextResponse.json(newService[0], { status: 201 });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ error: "Erro ao criar serviço" }, { status });
  }
}

export async function PATCH(req: Request) {
  await requireSession();
  try {
    const body = await req.json();
    const { code, ...data } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Código não encontrado" },
        { status: 400 }
      );
    }

    const updated = await storage.service.updateService(code, data);

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { error: "Erro ao atualizar serviço" },
      { status }
    );
  }
}

export async function DELETE(req: Request) {
  await requireSession();
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Código não encontrado" },
        { status: 400 }
      );
    }

    await storage.service.deleteService(code);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;

    return NextResponse.json({ error: "Erro ao excluir serviço" }, { status });
  }
}
