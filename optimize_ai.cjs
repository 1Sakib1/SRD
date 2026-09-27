const fs = require('fs');

const path = 'src/app/pages/ReportRubbish.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Change AI model to gemini-1.5-flash
content = content.replace('model: "gemini-3.5-flash-lite"', 'model: "gemini-1.5-flash"');

// 2. Parallelize the photo upload and AI detection
const photoUploadRegex = /const handlePhotoUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?detectRubbishWithAI\(compressedBase64\);\n      \} catch \(err\) \{/;

const newPhotoUpload = `const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        
        // Let AI analyze the base64 version IMMEDIATELY (in parallel)
        detectRubbishWithAI(compressedBase64);
        
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
      } catch (err) {`;

content = content.replace(photoUploadRegex, newPhotoUpload);

fs.writeFileSync(path, content);
console.log('Optimized AI speed and parallelized uploads');
