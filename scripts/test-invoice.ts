import { service } from "@/services";

async function testCreateInvoice() {
  try {
    console.log("Testing invoice creation...");

    const testInvoiceData = {
      supplierCnpj: "04825080000175", // Replace with existing supplier CNPJ
      serviceCode: "701M -Paisagismo", // Replace with existing service code
      valueCents: 10000, // R$ 100.00 in cents
      entryDate: "2025-10-15",
      issueDate: "2025-10-15",
      dueDate: "2025-11-15",
      description: "Test invoice description",
      invoiceNumber: "INV-TEST-001",
      materialDeductionCents: 1000, // R$ 10.00 in cents
    };

    console.log("Test data:", testInvoiceData);

    const result = await service.invoice.createInvoice(testInvoiceData);

    console.log("Invoice creation result:");
    console.log("Net amount (cents):", result);
    console.log("Net amount (R$):", (result / 100).toFixed(2));
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
