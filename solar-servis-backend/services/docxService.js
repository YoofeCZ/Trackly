async function generateWordDocument(report) {
    const sections = [
        new Paragraph({ text: `Report: ${report.opCode}`, heading: "Title" }),
        new Paragraph({ text: `Client: ${report.Client.name}` }),
        new Paragraph({ text: `Technician: ${report.Technician.name}` }),
        new Paragraph({ text: `Total Costs: ${report.totalCosts}` }),
    ];

    report.tasks.forEach((task, index) => {
        sections.push(new Paragraph({ text: `Task ${index + 1}:` }));
        sections.push(new Paragraph({ text: `Description: ${task.description}` }));
        sections.push(new Paragraph({ text: `Departure: ${task.departureTime}` }));
        sections.push(new Paragraph({ text: `Arrival: ${task.arrivalTime}` }));
        sections.push(new Paragraph({ text: `Materials Used:` }));
        task.materials.forEach((material) => {
            sections.push(
                new Paragraph({
                    text: `- ${material.name}: ${material.quantity} x ${material.unitPrice}`,
                })
            );
        });
    });

    const doc = new Document({ sections: [{ children: sections }] });
    return await Packer.toBuffer(doc);
}