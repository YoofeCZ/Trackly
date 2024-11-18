function calculateCosts(materials, hourlyRate, travelCost, totalTime) {
    // Výpočet ceny za materiál
    const materialCost = materials.reduce((sum, material) => {
        return sum + (material.quantity * material.unitPrice || 0);
    }, 0);

    // Výpočet ceny za práci
    const laborCost = hourlyRate * totalTime;

    // Celkové náklady
    const totalCosts = laborCost + materialCost + (travelCost || 0);

    return {
        laborCost,
        materialCost,
        travelCost: travelCost || 0,
        totalCosts,
    };
}
module.exports = { calculateCosts };

function calculateTotalTime(departureTime, arrivalTime, transitionTime) {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);

    if (isNaN(departure) || isNaN(arrival)) {
        throw new Error('Čas odjezdu nebo příjezdu není platný.');
    }

    const totalTimeInMilliseconds = arrival - departure;
    const transitionTimeInMilliseconds = transitionTime ? Number(transitionTime) * 60 * 1000 : 0;

    const totalTime = totalTimeInMilliseconds + transitionTimeInMilliseconds;

    if (totalTime < 0) {
        throw new Error('Celkový čas nemůže být záporný.');
    }

    // Převod na hodiny
    return totalTime / (1000 * 60 * 60); // Hodiny
}
module.exports = { calculateTotalTime };
