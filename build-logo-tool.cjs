const fs = require('fs');
const svg = fs.readFileSync('public/litterpin-favicon.svg', 'utf8');
const html = `
<!DOCTYPE html>
<html style="background:#111; color:white; font-family:sans-serif; text-align:center; padding:50px;">
<head>
  <title>Logo Generator</title>
</head>
<body>
  <h1>Generating HD Logo...</h1>
  <canvas id="c" width="512" height="512" style="display:none;"></canvas>
  <script>
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(\`${svg}\`);
    img.onload = () => {
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 512, 512);
      
      // Draw centered
      const padding = 64;
      const w = 512 - padding * 2;
      const h = (120/100) * w;
      const y = (512 - h) / 2;
      
      ctx.drawImage(img, padding, y, w, h);
      
      const a = document.createElement('a');
      a.download = 'LitterPin-HD-Logo.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      
      document.body.innerHTML = '<h1>✅ Downloaded LitterPin-HD-Logo.png</h1><p>You can now upload this high-definition transparent PNG to Google Cloud!</p>';
    };
  </script>
</body>
</html>
`;
fs.writeFileSync('public/logo-tool.html', html);
