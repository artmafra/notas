import { NextResponse } from "next/server";
import { db } from "../../../db/db";
import { suppliers } from "../../../db/schemas/suppliers.schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const supplierSchema = z.object({
  cnpj: z.string(),
  name: z.string(),
  city: z.string(),
  taxRegime: z.string(),
  obs: z.string(),
});

export async function GET() {
  try {
    const supplier = await db.select().from(suppliers);
    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Erro ao buscar fornecedor");
    return NextResponse.json(
      { error: "Erro ao buscar fornecedor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = supplierSchema.parse(body);

    const newSupplier = await db.insert(suppliers).values(data).returning();
    return NextResponse.json(newSupplier[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar fornecedor");
    return NextResponse.json(
      { error: "Erro ao criar fornecedor" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateSupplier } = body;

    if (!id) {
      NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    const updated = await db
      .update(suppliers)
      .set(updateSupplier)
      .where(eq(suppliers.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Erro ao atualizar fornecedor", error);
    return NextResponse.json(
      { error: "Erro ao atualizar fornecedor" },
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

    await db.delete(suppliers).where(eq(suppliers.id, id)).returning();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover fornecedor", error);
    return NextResponse.json(
      { error: "Erro ao remover fornecedor" },
      { status: 400 }
    );
  }
}
