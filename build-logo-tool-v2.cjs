const fs = require('fs');

const html = `
<!DOCTYPE html>
<html style="background:#111; color:white; font-family:sans-serif; text-align:center; padding:50px;">
<head>
  <title>Logo Fixer</title>
</head>
<body>
  <h1>Fixing Logo Proportions...</h1>
  <canvas id="c" width="512" height="512" style="display:none;"></canvas>
  <script>
    const img = new Image();
    // Load the original transparent PNG directly from the site
    img.src = '/images/../litterpin-logo-transparent.png'; 
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 512, 512);
      
      // The original image is 222x270 (portrait). 
      // Google squashes it if we don't upload a perfect square.
      // We will draw it perfectly centered in a 512x512 square box without stretching.
      
      // Calculate scaled dimensions to fit inside 512x512 while keeping aspect ratio
      const scale = Math.min(512 / img.width, 512 / img.height) * 0.8; // 80% of max size for some padding
      const w = img.width * scale;
      const h = img.height * scale;
      
      const x = (512 - w) / 2;
      const y = (512 - h) / 2;
      
      ctx.drawImage(img, x, y, w, h);
      
      const a = document.createElement('a');
      a.download = 'LitterPin-Square-Logo.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      
      document.body.innerHTML = '<h1>✅ Downloaded LitterPin-Square-Logo.png</h1><p>This logo is now perfectly square! Google will no longer stretch or squash it.</p>';
    };
  </script>
</body>
</html>
`;
fs.writeFileSync('public/logo-tool.html', html);
