import { NextResponse } from "next/server";
import { db } from "../../../db/db";
import {
  insertInvoiceSchema,
  invoices,
  updateInvoiceSchema,
} from "../../../db/schemas/invoices.schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { storage } from "@/storage";

export async function GET() {
  try {
    const invoice = await storage.invoice.getAllInvoices();
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Erro ao buscar notas fiscais", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar nota fiscal",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = insertInvoiceSchema.parse(body);
    const newInvoice = await storage.invoice.createInvoice(data);

    return NextResponse.json(newInvoice[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar nova nota fiscal", error);
    return NextResponse.json(
      { error: "Erro ao criar nova nota fiscal" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = updateInvoiceSchema.parse(body);

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    const updated = await storage.invoice.updateInvoice(id, data);

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Erro ao atualizar nota fiscal", error);
    return NextResponse.json(
      { error: "Erro ao atualizar nota fiscal" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" });
    }

    await storage.invoice.deleteInvoice(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir nota fiscal", error);
    return NextResponse.json(
      { error: "Erro ao excluir nota fiscal" },
      { status: 400 }
    );
  }
}
