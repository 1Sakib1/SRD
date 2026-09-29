import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a1118] text-gray-300 py-24 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto bg-[#131d26] rounded-2xl p-8 sm:p-12 border border-white/10 shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: September 29, 2026</p>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to LitterPin. We are committed to protecting your personal information and your right to privacy.
            If you have any questions or concerns about this privacy notice or our practices with regard to your personal information,
            please contact us at <strong>litterpin.org@gmail.com</strong>.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the Website, 
            express an interest in obtaining information about us or our products and Services, when you participate in activities on the Website 
            (such as reporting litter), or otherwise when you contact us.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-400">
            <li><strong>Personal Information Provided by You:</strong> We collect names; phone numbers; email addresses; usernames; passwords; and other similar information.</li>
            <li><strong>Social Media Login Data:</strong> We may provide you with the option to register with us using your existing social media account details, like your Google account. We will collect the information described in the section called "How We Handle Your Social Logins" below.</li>
            <li><strong>Location Data:</strong> We collect device location data when you submit a litter report to accurately pin the location on our globe map.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. How We Handle Your Social Logins</h2>
          <p>
            If you choose to register or log in to our services using a social media account (such as Google), we receive certain profile information about you from your social media provider. The profile Information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture.
          </p>
          <p>
            We will use the information we receive only for the purposes that are described in this privacy notice or that are otherwise made clear to you on the relevant Services.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. How We Use Your Information</h2>
          <p>
            We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-400">
            <li>To facilitate account creation and logon process.</li>
            <li>To post user-generated litter reports to the global map.</li>
            <li>To request feedback and to contact you about your use of our Website.</li>
            <li>To protect our Services from fraudulent activity.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Will Your Information Be Shared With Anyone?</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal information to third parties.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have questions or comments about this notice, you may email us at <strong>litterpin.org@gmail.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
