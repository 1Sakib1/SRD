const fs = require('fs');

let code = fs.readFileSync('src/app/pages/ReportRubbish.tsx', 'utf8');

// 1. Add login to useAuth
code = code.replace('const { user, isGuest } = useAuth();', 'const { user, login, isGuest } = useAuth();');

// 2. Add states for modal
const stateInsertPos = code.indexOf('const [guestEmail, setGuestEmail] = useState(\'\');');
code = code.substring(0, stateInsertPos) + `const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState('');
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  ` + code.substring(stateInsertPos);

// 3. Rewrite handleSubmit
const handleSubmitMatch = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (!type || !description || !latitude) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      setIsSubmitting(false);
      setShowGuestModal(true);
      return;
    }

    await submitReportData(user.id, user.email);
  };

  const submitReportData = async (userId: string, emailStr?: string) => {
    try {
      const response = await fetch(
        \`https://\${projectId}.supabase.co/functions/v1/make-server-3e3b490b/reports/submit\`,
        {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${publicAnonKey}\`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            type,
            description,
            photo,
            location: { lat: parseFloat(latitude), lng: parseFloat(longitude), address },
            guestEmail: guestEmail || emailStr,
          }),
        }
      );
      if (response.ok) {
        await loadReports();
        if (emailStr || guestEmail) {
          const targetEmail = emailStr || guestEmail;
          toast.success(\`Report submitted! A confirmation email is being sent to \${targetEmail}.\`);
          try {
            fetch('https://qqxftmbuosckaqpmetcc.supabase.co/functions/v1/make-server-3e3b490b/email/send-confirmation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: targetEmail, name: guestNameInput || 'User', reportType: type })
            });
          } catch(e) {}
        } else {
          toast.success('Report submitted successfully!');
        }
        setType('');
        setDescription('');
        setPhoto('');
        setShowGuestModal(false);
        setGuestEmail('');
        
        // Remove from sessionStorage
        sessionStorage.removeItem('pendingReportData');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit report');
      }
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail) {
      toast.error('Email is required for confirmation');
      return;
    }
    
    setIsGuestLoading(true);
    try {
      // 1. Create anonymous account
      const response = await fetch(
        \`https://\${projectId}.supabase.co/functions/v1/make-server-3e3b490b/auth/anonymous-login\`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: guestEmail, name: guestNameInput })
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Failed to create anonymous account');
        setIsGuestLoading(false);
        return;
      }
      
      // 2. Log them in locally
      login(data.user);
      
      // 3. Submit report using new user ID
      setIsSubmitting(true);
      await submitReportData(data.user.id, data.user.email);
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsGuestLoading(false);
    }
  };
`;

// Replace the old handleSubmit block
// We need to carefully slice out the old handleSubmit.
// The old handleSubmit starts with `const handleSubmit = async` and ends just before `return (`
const hsStart = code.indexOf('const handleSubmit = async (e: React.FormEvent) => {');
const hsEnd = code.indexOf('return (', hsStart);

code = code.substring(0, hsStart) + handleSubmitMatch + code.substring(hsEnd);

// 4. Add the Guest Modal at the end
const guestModalJSX = `
      {/* Guest Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowGuestModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Almost Done!</h3>
              <p className="text-gray-600">You can log in to track your reports, or just report anonymously.</p>
            </div>
            
            <div className="space-y-4">
              <Link to="/auth?redirect=/report" className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors">
                Log In to Track Reports
              </Link>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR REPORT ANONYMOUSLY</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (for confirmation)</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name (Optional)</label>
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Anonymous Reporter"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isGuestLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isGuestLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Anonymously'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`;

const lastClosingTag = code.lastIndexOf('</div>');
const endOfReturn = code.lastIndexOf('  );', lastClosingTag + 20); // Just finding the end of the file

// Just replace the very end of the file.
const splitStr = '    </div>\n  );\n};';
if (code.includes(splitStr)) {
  code = code.replace(splitStr, guestModalJSX);
} else if (code.includes('    </div>\r\n  );\r\n};')) {
  code = code.replace('    </div>\r\n  );\r\n};', guestModalJSX);
} else {
  // Manual fallback
  code = code.replace(/    <\/div>\s*\);\s*};\s*$/, guestModalJSX);
}

fs.writeFileSync('src/app/pages/ReportRubbish.tsx', code);
console.log("React UI patched.");
