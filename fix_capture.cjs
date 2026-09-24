const fs = require('fs');

let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

const target = '<input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} \nclassName="hidden" id="photo-upload" />';
const target2 = '<input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />';
const replacement = '<input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />';

if (content.includes('capture="environment"')) {
    content = content.replace('capture="environment" ', '');
    fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
    console.log('Removed capture attribute');
} else {
    console.log('Capture attribute not found');
}
