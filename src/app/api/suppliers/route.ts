import { insertSupplierSchema } from "@/db/schemas";
import { storage } from "@/storage";
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
    const supplier = await storage.supplier.getAllSuppliers();
    return NextResponse.json(supplier);
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json(
      { error: "Erro ao buscar fornecedor" },
      { status }
    );
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
    console.log(123, body);
    const data = insertSupplierSchema.parse(body);

    const newSupplier = await storage.supplier.createSupplier(data);

    return NextResponse.json(newSupplier[0], { status: 201 });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ error: "Erro ao criar fornecedor" }, { status });
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
    const { cnpj, ...data } = body;

    if (!cnpj) {
      NextResponse.json({ error: "CNPJ não encontrado" }, { status: 400 });
    }

    const updated = await storage.supplier.updateSupplier(cnpj, data);

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { error: "Erro ao atualizar fornecedor" },
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
    const { cnpj } = await req.json();

    if (!cnpj) {
      return NextResponse.json(
        { error: "CNPJ não encontrado" },
        { status: 400 }
      );
    }

    await storage.supplier.deleteSupplier(cnpj);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json(
      { error: "Erro ao remover fornecedor" },
      { status }
    );
  }
}
