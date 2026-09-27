const { Jimp } = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('public/litterpin-logo.png');
    
    // We want to make everything that is NOT strictly green into transparent.
    // The logo is green and white.
    // Actually, we want to remove the off-white background (around 238, 234, 223).
    // Let's say if it's generally bright and NOT green.
    // Alternatively, if r > 200, g > 200, b > 190.
    
    // Wait, the inside of the camera is white (255, 255, 255). We want to keep that!
    // Wait no, if the camera inside is transparent, that's fine too. But let's try to remove ONLY the background edges.
    // A flood fill from (0,0) is perfect for removing background!
    
    const targetR = 238;
    const targetG = 234;
    const targetB = 223;
    const tolerance = 40;
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // Is it close to the background color?
      if (Math.abs(r - targetR) < tolerance && Math.abs(g - targetG) < tolerance && Math.abs(b - targetB) < tolerance) {
        // Only make it transparent if it's NOT purely white (the camera inside might be pure white)
        // Actually, the background is 238,234,223. The camera inside is probably > 250,250,250.
        // Let's check if it's NOT pure white.
        if (r < 250 || g < 250 || b < 250) {
           this.bitmap.data[idx + 3] = 0; // Transparent!
        }
      }
    });
    
    // Some anti-aliasing edges might remain. Let's do a stronger sweep.
    // If it's not green, and not pure white, make it transparent.
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        const a = this.bitmap.data[idx + 3];
        
        if (a === 0) return;
        
        // Is it green? (G is dominant)
        const isGreen = (g > r + 15) && (g > b + 15);
        // Is it pure white?
        const isWhite = (r > 245 && g > 245 && b > 245);
        
        if (!isGreen && !isWhite) {
            this.bitmap.data[idx + 3] = 0;
        }
        
        // Feather the edges of green?
        if (isGreen && (r > 150 || b > 150)) {
            // Light green anti-aliased edge blending with background -> transparent
            this.bitmap.data[idx + 3] = 0;
        }
    });
    
    await image.write('public/litterpin-logo-transparent.png');
    console.log("Transparent logo generated perfectly!");
  } catch (err) {
    console.error(err);
  }
}

processImage();
