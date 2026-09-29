import React from 'react';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a1118] text-gray-300 py-24 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto bg-[#131d26] rounded-2xl p-8 sm:p-12 border border-white/10 shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: September 29, 2026</p>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to LitterPin! These Terms of Service outline the rules and regulations for the use of the LitterPin Website.
            By accessing this website we assume you accept these terms and conditions. Do not continue to use LitterPin if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Accounts and Registration</h2>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party social media service (e.g., Google).
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. User Generated Content</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"), specifically environmental reports and litter tracking pins. 
            You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
          </p>
          <p>
            By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Acceptable Use</h2>
          <p>
            You agree not to use the Service:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-400">
            <li>In any way that violates any applicable national or international law or regulation.</li>
            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
            <li>To impersonate or attempt to impersonate LitterPin, a LitterPin employee, another user, or any other person or entity.</li>
            <li>To post fake, abusive, or irrelevant locations to the public map.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at <strong>litterpin.org@gmail.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
