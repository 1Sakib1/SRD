const fs = require('fs');

const path = 'src/app/pages/ReportRubbish.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add isSubmitting state
if (!content.includes('const [isSubmitting')) {
  content = content.replace(
    'const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);',
    'const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);\n  const [isSubmitting, setIsSubmitting] = useState(false);'
  );
}

// 2. Wrap handleSubmit
const handleRegex = /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?e\.preventDefault\(\);/;
const newHandle = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);`;
content = content.replace(handleRegex, newHandle);

// Ensure we reset isSubmitting on early return or end of function
// Replace 'return;' in the early returns with 'return setIsSubmitting(false);' Wait, setting state returns undefined, so `setIsSubmitting(false); return;` is better.
content = content.replace(
  "toast.error('Please fill in all required fields');\n      return;",
  "toast.error('Please fill in all required fields');\n      setIsSubmitting(false);\n      return;"
);

content = content.replace(
  "navigate('/auth?redirect=/report');\n      return;",
  "navigate('/auth?redirect=/report');\n      setIsSubmitting(false);\n      return;"
);

// Add a finally block to the try-catch
// Find the end of the try-catch block inside handleSubmit
const tryCatchEndRegex = /toast\.error\('Failed to submit report'\);\n    \}/;
content = content.replace(
  tryCatchEndRegex,
  "toast.error('Failed to submit report');\n    } finally {\n      setIsSubmitting(false);\n    }"
);

// 3. Update the submit button
const buttonRegex = /<button type="submit" className="w-full py-4 bg-\[#00B150\] text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg">[\s\S]*?<\/button>/;
const newButton = `<button type="submit" disabled={isSubmitting} className={\`w-full py-4 bg-[#00B150] text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-all \${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-700'}\`}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>`;
content = content.replace(buttonRegex, newButton);

fs.writeFileSync(path, content);
console.log('Fixed double-submit bug');
