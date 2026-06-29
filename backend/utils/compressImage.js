const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const compressImage = async (filePath) => {
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  const dirName = path.dirname(filePath);

  const outputPath = path.join(dirName, `${baseName}-compressed.jpg`);

  await sharp(filePath)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toFile(outputPath);

  fs.unlinkSync(filePath);

  return outputPath;
};

module.exports = compressImage;