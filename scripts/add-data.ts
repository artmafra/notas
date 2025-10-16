import { storage } from "@/storage";

async function createData() {
  await storage.supplier.createSupplier({
    cnpj: "04825080000175",
    name: "SANTOS & YAMAZAKI",
    taxRegime: "SN",
    city: "Campinas",
    obs: "This is a test supplier",
  });

  await storage.service.createService({
    code: "701M -Paisagismo",
    description: "Paisagismo e congêneres.",
    sn_issqn: "1.00",
    sn_inss: "11.00",
    sn_cs: null,
    sn_irrf: null,

    n_issqn: "5.00",
    n_inss: "11.00",
    n_cs: "4.65",
    n_irrf: "1.50",

    mei_issqn: null,
    mei_inss: null,
    mei_cs: null,
    mei_irrf: null,

    debit: "53",
  });
}

// Run the test
createData();
