import { NextResponse } from "next/server";
import { db } from "../../../db/db";
import { invoices } from "../../../db/schemas/invoices.schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const invoiceSchema = z.object({
  supplierId: z.number(),
  serviceCode: z.string(),
  entryDate: z.iso.datetime(),
  issueDate: z.iso.datetime(),
  dueDate: z.iso.datetime(),
  valueCents: z.number(),
  invoiceNumber: z.string(),
  materialDeductionCents: z.number().optional().default(0),
  issqnCents: z.number(),
  csCents: z.number(),
  inssCents: z.number(),
  netAmountCents: z.number(),
});

export async function GET() {
  try {
    const invoice = await db.select().from(invoices);
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
    const data = invoiceSchema.parse(body);
    const preparedData = {
      ...data,
      issueDate: new Date(data.issueDate),
      entryDate: new Date(data.entryDate),
      dueDate: new Date(data.dueDate),
    };

    const newInvoice = await db
      .insert(invoices)
      .values(preparedData)
      .returning();

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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    const updated = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();

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

    await db.delete(invoices).where(eq(invoices.id, id)).returning();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir nota fiscal", error);
    return NextResponse.json(
      { error: "Erro ao excluir nota fiscal" },
      { status: 400 }
    );
  }
}
