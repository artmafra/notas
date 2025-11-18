import { insertInvoiceSchema, updateInvoiceSchema } from "@/db/schemas";
import { service } from "@/services";
import { storage } from "@/storage";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/helper";

export async function GET() {
  await requireSession();
  try {
    const invoice = await storage.invoice.getAllInvoices();
    return NextResponse.json(invoice);
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      {
        error: "Erro ao buscar nota fiscal",
      },
      {
        status,
      }
    );
  }
}

export async function POST(req: Request) {
  await requireSession();
  try {
    const body = await req.json();
    const data = insertInvoiceSchema.parse(body);
    await service.invoice.createInvoice(data);

    return NextResponse.json({}, { status: 201 });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { error: "Erro ao criar nova nota fiscal" },
      { status }
    );
  }
}

export async function PATCH(req: Request) {
  await requireSession();
  try {
    const body = await req.json();
    const { id, ...data } = updateInvoiceSchema.parse(body);

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    const updated = await storage.invoice.updateInvoice(id, data);

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { error: "Erro ao atualizar nota fiscal" },
      { status }
    );
  }
}

export async function DELETE(req: Request) {
  await requireSession();
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" });
    }

    await storage.invoice.deleteInvoice(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { error: "Erro ao excluir nota fiscal" },
      { status }
    );
  }
}
