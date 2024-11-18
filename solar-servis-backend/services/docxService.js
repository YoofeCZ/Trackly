const { Document, Packer, Paragraph, TextRun } = require('docx');

async function generateWordDocument(report) {
    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({ text: `Report: ${report.opCode}`, heading: "Title" }),
                    new Paragraph({ text: `Client: ${report.Client.name}` }),
                    new Paragraph({ text: `Technician: ${report.Technician.name}` }),
                    new Paragraph({ text: `Description: ${report.description}` }),
                    new Paragraph({ text: `Total Costs: ${report.totalCosts}` }),
                ],
            },
        ],
    });

    return await Packer.toBuffer(doc);
}
module.exports = { generateWordDocument };
