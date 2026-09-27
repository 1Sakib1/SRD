const { Jimp } = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('public/litterpin-logo.png');
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // Cream background is roughly > 230 on all channels
      if (r > 230 && g > 230 && b > 230) {
        this.bitmap.data[idx + 3] = 0; // Transparent!
      }
    });
    
    await image.write('public/litterpin-logo-transparent.png');
    
    // Also let's update the favicon SVG to match the exact original logo?
    // Actually, the user doesn't like the SVG at all. "You have changed the integrity of the logo"
    console.log("Transparent logo generated!");
  } catch (err) {
    console.error(err);
  }
}

processImage();
