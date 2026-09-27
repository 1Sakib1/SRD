const fs = require('fs');
const path = require('path');

// 1. Update index.html
const indexPath = 'index.html';
let indexContent = fs.readFileSync(indexPath, 'utf8');
indexContent = indexContent.replace(/https:\/\/admin\.litterpin\.org/g, 'https://litterpin.org');
fs.writeFileSync(indexPath, indexContent);
console.log('Updated index.html URLs');

// 2. Update robots.txt
const robotsPath = path.join('public', 'robots.txt');
if (fs.existsSync(robotsPath)) {
  let robotsContent = fs.readFileSync(robotsPath, 'utf8');
  robotsContent = robotsContent.replace(/https:\/\/admin\.litterpin\.org/g, 'https://litterpin.org');
  fs.writeFileSync(robotsPath, robotsContent);
  console.log('Updated robots.txt URLs');
}

// 3. Update sitemap.xml
const sitemapPath = path.join('public', 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  sitemapContent = sitemapContent.replace(/https:\/\/admin\.litterpin\.org/g, 'https://litterpin.org');
  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log('Updated sitemap.xml URLs');
}
