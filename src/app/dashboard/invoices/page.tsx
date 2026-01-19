import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { InvoiceService } from "@/services/invoice.service";
import { InvoicesClient } from "./invoices-client";

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const service = new InvoiceService();
  const invoices = await service.getAllInvoices();

  return <InvoicesClient invoices={invoices} />;
}
