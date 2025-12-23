"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CartItem } from "@/store/cartStore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface GenerateQuotationButtonProps {
  items: CartItem[];
}

export function GenerateQuotationButton({ items }: GenerateQuotationButtonProps) {
  const { data: session } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const generateQuotation = async () => {
    if (!session?.user) return;

    setIsGenerating(true);
    try {
      const quotationNumber = `QT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Generate PDF
      const doc = new jsPDF();

      // Letterhead - themed to match app (brand yellow / green)
      doc.setFillColor(204, 190, 26); // #CCBE1A
      doc.rect(0, 0, 210, 35, "F");
      doc.setFillColor(120, 143, 53); // #788F35
      doc.rect(0, 30, 210, 5, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("B2B Portal", 105, 18, { align: "center" });
      doc.setFontSize(11);
      doc.text("Business to Business E-commerce", 105, 25, { align: "center" });

      // Reset text color for body
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.text("QUOTATION", 20, 55);
      
      doc.setFontSize(10);
      doc.text(`Quotation Number: ${quotationNumber}`, 20, 65);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
      doc.text(`Customer: ${session.user.email}`, 20, 75);

      // Table data
      const tableData = items.map((item, index) => [
        index + 1,
        item.name,
        item.colorVariant,
        item.quantity.toString(),
        `PKR ${item.price.toFixed(2)}`,
        `PKR ${(item.price * item.quantity).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 85,
        head: [["#", "Product", "Color", "Quantity", "Unit Price", "Total"]],
        body: tableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [120, 143, 53] }, // #788F35
        alternateRowStyles: { fillColor: [246, 248, 237] },
      });

      // Total
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Total Amount: PKR ${totalAmount.toFixed(2)}`, 20, finalY);

      // Save PDF
      doc.save(`quotation-${quotationNumber}.pdf`);

      // Save to database
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotationNumber,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            colorVariant: item.colorVariant,
          })),
          totalAmount,
        }),
      });

      if (response.ok) {
        setIsGenerated(true);
      }
    } catch (error) {
      console.error("Error generating quotation:", error);
      alert("Failed to generate quotation");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateQuotation}
      disabled={isGenerating || isGenerated}
      className={`w-full py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 rounded-full transition-colors ${
        isGenerated
          ? "bg-emerald-600 text-white"
          : "bg-slate-900 text-white hover:bg-slate-800"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isGenerating ? (
        "Generating..."
      ) : isGenerated ? (
        <>
          <span>✓</span> Quotation Generated
        </>
      ) : (
        "Generate Quotation"
      )}
    </button>
  );
}

