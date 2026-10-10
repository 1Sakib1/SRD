import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a1118] text-gray-300 py-24 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto bg-[#131d26] rounded-2xl p-8 sm:p-12 border border-white/10 shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: September 29, 2026</p>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to LitterPin ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website https://litterpin.org and use our application.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect personal information that you voluntarily provide to us when you register on the Website, including:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-400">
            <li><strong>Personal Information Provided by You:</strong> We collect names, email addresses, usernames, and passwords used to create your account.</li>
            <li><strong>Google User Data (OAuth):</strong> When you choose to log in using Google, we request access to your Google account's primary email address and your basic profile information (name and profile picture). <strong>We do not request, access, or store any other data from your Google account.</strong></li>
            <li><strong>Location Data:</strong> We collect device location coordinates only when you actively submit a litter report to accurately pin the location on our global map.</li>
            <li><strong>User-Generated Content:</strong> Any photos, descriptions, and reports of litter you submit to the platform.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect or receive for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-400">
            <li><strong>To facilitate account creation and the login process:</strong> Specifically, we use your Google email address to uniquely identify your account and allow you to log in securely without a password.</li>
            <li><strong>To provide and manage Services:</strong> We use your location data and user-generated content to populate the interactive global map of litter reports.</li>
            <li><strong>To communicate with you:</strong> We may use your email address to send you administrative information, account alerts, or respond to your inquiries.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Data Retention and Deletion</h2>
          <p>
            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law.
          </p>
          <p>
            <strong>Right to Deletion:</strong> You have the right to request the deletion of your personal data. You can permanently delete your account and all associated data, including your Google OAuth data, at any time by contacting us at <strong>litterpin.org@gmail.com</strong>. Upon receiving a deletion request, we will securely erase your data from our active databases within 30 days.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Compliance with Google API Services User Data Policy</h2>
          <p>
            LitterPin's use and transfer to any other app of information received from Google APIs will adhere strictly to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-[#00B150] hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements. We do not share, sell, or transfer your Google User Data to any third-party advertisers, data brokers, or unnecessary external services.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Information Security</h2>
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. All data, including authentication tokens and personal details, is encrypted in transit and at rest using industry-standard protocols.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, your data, or if you wish to exercise your data deletion rights, please contact our Data Protection Officer at <strong>litterpin.org@gmail.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
