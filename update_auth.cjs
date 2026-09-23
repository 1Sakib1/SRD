const fs = require('fs');
const content = fs.readFileSync('src/app/pages/Auth.tsx', 'utf8');

const newHandleLogin = `  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        toast.error(authError.message);
        setIsSubmitting(false);
        return;
      }
      if (authData.user) {
        const { data: userProfile, error: profileError } = await supabase.from('users').select('*').eq('email', email.toLowerCase().trim()).single();
        let userData = userProfile;
        const ADMIN_EMAILS = ['adminsrd1@srd.com.au', 'adminsrd2@srd.com.au', 'adminsrd3@srd.com.au', 'adminsrd4@srd.com.au'];
        if (profileError && ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
          userData = { id: authData.user.id, email: email.toLowerCase().trim(), name: 'Admin', role: 'admin', eco_points: 0, credits: 0 };
        } else if (profileError) {
          toast.error('Failed to load user profile');
          setIsSubmitting(false);
          return;
        }
        const finalUser = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          ecoPoints: userData.eco_points || userData.ecoPoints || 0,
          credits: userData.credits || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        login(finalUser as any);
        if (finalUser.role === 'admin') {
          toast.success('Welcome back, Admin!');
          navigate('/admin');
        } else {
          toast.success('Welcome back!');
          const redirect = searchParams.get('redirect') || '/dashboard';
          navigate(redirect);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };`;

const startIndex = content.indexOf('  const handleLogin = async (e: React.FormEvent) => {');
const endIndex = content.indexOf('  const handleGoogleLogin = async () => {');

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + newHandleLogin + '\n\n' + content.substring(endIndex);
    fs.writeFileSync('src/app/pages/Auth.tsx', newContent);
    console.log('Successfully updated Auth.tsx');
} else {
    console.log('Could not find start or end index', startIndex, endIndex);
}
