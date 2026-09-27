const { Jimp } = require('jimp');

async function testImage() {
  try {
    const image = await Jimp.read('public/litterpin-logo.png');
    
    const r = image.bitmap.data[0];
    const g = image.bitmap.data[1];
    const b = image.bitmap.data[2];
    
    console.log("Top left pixel:", r, g, b);
  } catch (err) {
    console.error(err);
  }
}

testImage();
