const { Jimp } = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('public/litterpin-logo.png');
    
    // Scan all pixels
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // The background is cream/off-white. The logo is green and white.
      // Wait, if we make white transparent, the camera inside will be transparent too!
      // That's actually PERFECT for a mask! If the camera inside is transparent, it will let the background through.
      // But wait, the camera inside in the original logo is white, while the pin is green.
      // If we are using it as a CSS mask, we want the logo shape to be solid (black/opaque) and the background to be transparent.
      // Let's make anything that is NOT green into transparent, and anything green into solid black!
      
      // Is it green?
      // Green is roughly r < 100, g > 100, b < 100.
      // Actually, the primary green is #00B150 (R:0, G:177, B:80)
      if (g > r + 30 && g > b + 30) {
        // It's green! Make it solid black for the mask.
        this.bitmap.data[idx + 0] = 0;
        this.bitmap.data[idx + 1] = 0;
        this.bitmap.data[idx + 2] = 0;
        this.bitmap.data[idx + 3] = 255; // Opaque
      } else {
        // It's not green (it's the cream background or the white camera details)
        // Make it perfectly transparent!
        this.bitmap.data[idx + 3] = 0;
      }
    });
    
    await image.write('public/litterpin-mask.png');
    console.log("Mask generated!");
  } catch (err) {
    console.error(err);
  }
}

processImage();
