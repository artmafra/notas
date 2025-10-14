import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { insertSupplierSchema, suppliers } from "@/db/schemas";
import { db } from "@/db/db";
import { storage } from "@/storage";

export async function GET() {
  try {
    const supplier = await storage.supplier.getAllSuppliers();
    return NextResponse.json(supplier);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar fornecedor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(123, body);
    const data = insertSupplierSchema.parse(body);

    const newSupplier = await storage.supplier.createSupplier(data);

    return NextResponse.json(newSupplier[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar fornecedor" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    const updated = await storage.supplier.updateSupplier(id, data);

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(error);
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

    await storage.supplier.deleteSupplier(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao remover fornecedor" },
      { status: 400 }
    );
  }
}
