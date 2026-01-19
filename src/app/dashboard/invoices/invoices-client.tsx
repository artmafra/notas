"use client";

import { Invoice } from "@/db/schemas";

interface InvoicesClientProps {
  invoices: Invoice[];
}

export function InvoicesClient({ invoices }: InvoicesClientProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Notas Fiscais</h1>

      {invoices.length === 0 ? (
        <p className="text-gray-500">Nenhuma nota fiscal encontrada.</p>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Número da Nota Fiscal</th>
              <th className="p-3">CNPJ do Cliente</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Data de Emissão</th>
              <th className="p-3">Data de Vencimento</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b">
                <td className="p-3">{invoice.invoiceNumber}</td>
                <td className="p-3">{invoice.supplierCnpj}</td>
                <td className="p-3">
                  R$ {(invoice.netAmountCents / 100).toFixed(2)}
                </td>
                <td className="p-3">
                  {new Date(invoice.issueDate).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-3">
                  {new Date(invoice.dueDate).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
