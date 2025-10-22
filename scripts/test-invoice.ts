import { CreateInvoiceSchema } from "@/db/schemas";
import { service } from "@/services";

async function testCreateInvoice() {
  try {
    console.log("Testing invoice creation...");

    const testInvoiceData: CreateInvoiceSchema = {
      supplierCnpj: "783512000171", // Replace with existing supplier CNPJ
      serviceCode: "103M-Consultoria", // Replace with existing service code
      valueCents: 20000, // R$ 200.00 in cents
      entryDate: new Date("2025-10-15"),
      issueDate: new Date("2025-10-15"),
      dueDate: new Date("2025-10-15"),
      invoiceNumber: "INV-TEST-001",
      materialDeductionCents: 10000, // R$ 100.00 in cents
    };

    console.log("Test data:", testInvoiceData);

    await service.invoice.createInvoice(testInvoiceData);

    console.log("Invoice created");
  } catch (error) {
    console.error("Error testing invoice creation:", error);
    process.exit(1);
  }
}

// Run the test
testCreateInvoice()
  .then(() => {
    console.log("Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
