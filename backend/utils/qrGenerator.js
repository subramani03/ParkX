
const QRCode = require("qrcode");

const generateQR = async (text) => {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",   // 🔑 HIGH recovery
    type: "image/png",
    width: 500,                 // 🔑 High resolution
    margin: 2,                  // 🔑 Quiet zone
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
};

module.exports = generateQR;
