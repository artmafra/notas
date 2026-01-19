"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Notas Fiscais", href: "/invoices" },
  { label: "Serviços", href: "/services" },
  { label: "Fornecedores", href: "/suppliers" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-6">Contabilidade</h1>

      <nav className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded px-3 py-2 ${
              pathname === item.href ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
