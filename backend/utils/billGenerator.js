const { createCanvas, loadImage } = require("canvas");

/**
 * Generates a bill image using Canvas
 * @param {Object} billData 
 * @param {string} qrDataUrl 
 * @returns {Promise<string>} Base64 data URL of the generated bill image
 */
const generateBillImage = async (billData, qrDataUrl) => {
  const width = 400;
  const height = 550;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // 2. Indigo Header
  ctx.fillStyle = "#4f46e5"; // indigo-600
  ctx.fillRect(0, 0, width, 80);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("OFFICIAL ENTRY PASS", width / 2, 30);
  
  ctx.font = "black 24px sans-serif";
  ctx.fillText("ParkX SYSTEMS", width / 2, 60);

  // 3. Slot Section
  ctx.fillStyle = "#f8fafc"; // slate-50
  ctx.fillRect(20, 100, width - 40, 60);
  
  ctx.fillStyle = "#64748b"; // slate-500
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("SLOT", 40, 135);

  ctx.fillStyle = "#4f46e5";
  ctx.font = "bold 24px monospace";
  ctx.textAlign = "right";
  ctx.fillText(billData.slotNumber, width - 40, 140);

  // 4. Details Grid
  ctx.fillStyle = "#94a3b8"; // slate-400
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("VEHICLE", 40, 190);
  ctx.fillText("PHONE", 240, 190);

  ctx.fillStyle = "#0f172a"; // slate-900
  ctx.font = "bold 14px sans-serif";
  ctx.fillText(billData.vehicleNumber.toUpperCase(), 40, 210);
  ctx.fillText(billData.phone, 240, 210);

  // 5. Entry Timestamp
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "center";
  ctx.fillText("ENTRY TIMESTAMP", width / 2, 250);

  const entryTime = new Date(billData.entryTime).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  ctx.fillStyle = "#0f172a";
  ctx.font = "500 12px sans-serif";
  ctx.fillText(entryTime, width / 2, 270);

  // 6. QR Code
  if (qrDataUrl) {
    const qrImage = await loadImage(qrDataUrl);
    const qrSize = 150;
    ctx.drawImage(qrImage, (width - qrSize) / 2, 300, qrSize, qrSize);
    
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px sans-serif";
    ctx.fillText("SCAN AT EXIT FOR CHECKOUT", width / 2, 470);
  }

  // 7. Footer
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 500, width, 50);
  ctx.fillStyle = "#64748b";
  ctx.font = "10px sans-serif";
  ctx.fillText("Thank you for choosing ParkX!", width / 2, 530);

  return canvas.toDataURL("image/png");
};

/**
 * Generates an exit receipt image using Canvas
 * @param {Object} billData 
 * @returns {Promise<string>} Base64 data URL of the generated receipt image
 */
const generateExitReceiptImage = async (billData) => {
  const width = 400;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // 2. Header
  ctx.fillStyle = "#10b981"; // emerald-500
  ctx.fillRect(0, 0, width, 80);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("OFFICIAL EXIT RECEIPT", width / 2, 30);
  
  ctx.font = "black 24px sans-serif";
  ctx.fillText("ParkX SYSTEMS", width / 2, 60);

  // 3. Details
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(`Vehicle: ${billData.vehicleNumber.toUpperCase()}`, width / 2, 120);
  ctx.fillText(`Slot: ${billData.slotNumber}`, width / 2, 150);

  // 4. Timestamps
  ctx.fillStyle = "#64748b";
  ctx.font = "12px sans-serif";
  ctx.fillText("ENTRY", 100, 200);
  ctx.fillText("EXIT", 300, 200);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText(new Date(billData.entryTime).toLocaleString("en-IN"), 100, 220);
  ctx.fillText(new Date(billData.exitTime).toLocaleString("en-IN"), 300, 220);

  // 5. Amount
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(50, 260, width - 100, 100);
  
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("TOTAL AMOUNT PAID", width / 2, 300);
  
  ctx.fillStyle = "#10b981";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText(`₹${billData.amount || 0}`, width / 2, 340);

  // 6. Footer
  ctx.fillStyle = "#64748b";
  ctx.font = "12px sans-serif";
  ctx.fillText("Thank you for parking with us!", width / 2, 420);
  ctx.fillText("Drive Safe!", width / 2, 440);

  return canvas.toDataURL("image/png");
};

module.exports = { generateBillImage, generateExitReceiptImage };
