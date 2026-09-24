const fs = require('fs');

let content = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

const target = /const handlePhotoUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{\s*const file = e\.target\.files\?\.\[0\];\s*if \(file\) \{\s*try \{\s*const compressedBase64 = await compressImage\(file\);\s*setPhoto\(compressedBase64\);\s*detectRubbishWithAI\(compressedBase64\);\s*\} catch \(err\) \{\s*toast\.error\("Failed to process image"\);\s*\}\s*\}\s*\};/;

const replacement = `const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        
        // Show uploading state
        const toastId = toast.loading('Uploading image to secure storage...');
        
        // Convert Base64 back to Blob for Supabase Storage
        const res = await fetch(compressedBase64);
        const blob = await res.blob();
        const fileName = \`\${Date.now()}_\${Math.random().toString(36).substring(7)}.jpg\`;
        
        const { data, error } = await supabase.storage
          .from('report-images')
          .upload(fileName, blob, { contentType: 'image/jpeg' });
          
        if (error) {
          console.error('Storage upload error:', error);
          toast.error('Failed to upload image securely', { id: toastId });
          // Fallback to base64 if storage fails
          setPhoto(compressedBase64);
        } else {
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('report-images')
            .getPublicUrl(fileName);
            
          toast.success('Image uploaded successfully!', { id: toastId });
          
          // Set the photo to the lightweight public URL
          setPhoto(urlData.publicUrl);
        }
        
        // Let AI analyze the base64 version
        detectRubbishWithAI(compressedBase64);
      } catch (err) {
        toast.error("Failed to process image");
        console.error(err);
      }
    }
  };`;

if (content.match(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/app/pages/ReportRubbish.tsx', content);
    console.log('Patched handlePhotoUpload to use Supabase Storage');
} else {
    console.error('Target not found!');
}
