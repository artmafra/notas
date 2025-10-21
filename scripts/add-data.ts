import { storage } from "@/storage";

(async function () {
  await storage.supplier.createSupplier({
    cnpj: "783512000171",
    name: "AGUAJATO TRANSPORTES",
    taxRegime: "n",
    city: "Campinas",
    obs: "This is a test supplier",
  });

  await storage.service.createService({
    code: "103M-Consultoria",
    description: "Processamento de dados e congêneres.",
    debit: "3",
    sn: { issqn: 1.0, inss: null, cs: null, irrf: null },
    n: { issqn: 5.0, inss: 11.0, cs: 4.65, irrf: 1.5 },
    mei: { issqn: null, inss: null, cs: null, irrf: null },
  });
})();
