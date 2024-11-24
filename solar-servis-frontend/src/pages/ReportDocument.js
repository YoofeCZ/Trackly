import React from "react";
import { useLocation } from "react-router-dom";
import TemplateEditor from "../components/TemplateEditor";

const ReportDocument = () => {
  const location = useLocation();
  const { report } = location.state || {}; // Získání reportu z předané state

  // Výchozí obsah šablony s dynamickými daty
  const initialContent = {
    id: report.id,
    content: `<h1>Report pro ${report.client?.name || "Neznámý klient"}</h1>
      <p><b>Technik:</b> ${report.technician?.name || "Neznámý technik"}</p>
      <p><b>Datum:</b> ${report.date}</p>
      <p><b>Celková cena:</b> ${(
        (report.totalWorkCost || 0) +
        (report.totalTravelCost || 0) +
        (report.totalMaterialCost || 0)
      ).toFixed(2)} Kč</p>
      <h2>Použitý materiál:</h2>
      <ul>
        ${(report.materials || [])
          .map(
            (material) =>
              `<li>${material.name}: ${material.usedQuantity || 0} ks</li>`
          )
          .join("")}
      </ul>`,
  };

  const handleSaveTemplate = (content) => {
    console.log("Uložená šablona:", content);
    // Zde můžeš poslat data na server nebo uložit do stavu
  };

  return (
    <div>
      <h1>Editor dokumentu</h1>
      <TemplateEditor initialContent={initialContent} onSave={handleSaveTemplate} />
    </div>
  );
};

export default ReportDocument;
