import { NextResponse } from "next/server";
import { db } from "../../../db/db";
import { services } from "../../../db/schemas/services.schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const serviceSchema = z.object({
  code: z.string(),
  description: z.string(),
  debit: z.string(),
  sn_issqn: z.number(),
  sn_inss: z.number(),
  sn_cs: z.number(),
  sn_irrf: z.number(),
  n_issqn: z.number(),
  n_inss: z.number(),
  n_cs: z.number(),
  n_irrf: z.number(),
  mei_issqn: z.number(),
  mei_inss: z.number(),
  mei_cs: z.number(),
  mei_irrf: z.number(),
  obs: z.string(),
});

export async function GET() {
  try {
    const service = await db.select().from(services);
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
    const data = serviceSchema.parse(body);
    const preparedData = {
      ...data,
      sn_issqn: String(data.sn_issqn),
      sn_inss: String(data.sn_inss),
      sn_cs: String(data.sn_cs),
      sn_irrf: String(data.sn_irrf),
      n_issqn: String(data.n_issqn),
      n_inss: String(data.n_inss),
      n_cs: String(data.n_cs),
      n_irrf: String(data.n_irrf),
      mei_issqn: String(data.mei_issqn),
      mei_inss: String(data.mei_inss),
      mei_cs: String(data.mei_cs),
      mei_irrf: String(data.mei_irrf),
    };

    const newService = await db
      .insert(services)
      .values(preparedData)
      .returning();
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
    const { id, updateService } = body;

    if (!id) {
      return NextResponse.json({ error: "ID não encontrado" }, { status: 400 });
    }

    const updated = await db
      .update(services)
      .set(updateService)
      .where(eq(services.id, id))
      .returning();

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

    await db.delete(services).where(eq(services.id, id)).returning();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir serviço");
    return NextResponse.json(
      { error: "Erro ao excluir serviço" },
      { status: 400 }
    );
  }
}
