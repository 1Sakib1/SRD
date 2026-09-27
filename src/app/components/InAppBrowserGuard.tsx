import React, { useEffect, useState } from 'react';
import { ExternalLink, Compass } from 'lucide-react';

export const InAppBrowserGuard = ({ children }: { children: React.ReactNode }) => {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [os, setOs] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    if (/android/i.test(ua)) {
      setOs('android');
    } else if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setOs('ios');
    }

        const rules = [
      'FBAN', 'FBAV', 'FB4A', 'FB_IAB', 'FBIOS', 'FBOP', // Facebook Apps
      'Messenger', 'MessengerForiOS', 'MESSENGER',       // Facebook Messenger
      'Instagram',     // Instagram
      'Snapchat',      // Snapchat
      'Line',          // Line
      'LinkedIn',      // LinkedIn
      'Bytedance', 'TikTok', // TikTok
      'Twitter', 'X-Web', // Twitter
      'MicroMessenger' // WeChat
    ];

    const isApp = rules.some(rule => ua.includes(rule));
    setIsInAppBrowser(isApp);

    if (isApp) {
      if (/android/i.test(ua)) {
        const intentUrl = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;end;`;
        window.location.href = intentUrl;
      } else if (/iPad|iPhone|iPod/.test(ua)) {
        window.location.href = `googlechromes://${window.location.host}${window.location.pathname}`;
      }
    }
  }, []);

  if (isInAppBrowser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center z-[9999] relative">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Compass className="w-10 h-10 text-amber-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Almost there!
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            You are viewing LitterPin inside a social media app. To ensure Google Login works securely, please open this page in your phone's default browser.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 relative overflow-hidden">
            <h3 className="font-bold text-blue-900 mb-2">How to do this:</h3>
            
            {os === 'ios' && (
              <ul className="text-blue-800 text-sm space-y-3 text-left list-decimal pl-4">
                <li>Tap the <strong>three dots (⋯)</strong> or the share icon at the top right of your screen.</li>
                <li>Select <strong>"Open in System Browser"</strong> or <strong>"Open in Safari"</strong>.</li>
              </ul>
            )}
            
            {os === 'android' && (
              <ul className="text-blue-800 text-sm space-y-3 text-left list-decimal pl-4">
                <li>Tap the <strong>three dots (⋮)</strong> at the top right of your screen.</li>
                <li>Select <strong>"Open in Chrome"</strong> or <strong>"Open in Browser"</strong>.</li>
              </ul>
            )}

            {os === 'other' && (
              <ul className="text-blue-800 text-sm space-y-3 text-left list-decimal pl-4">
                <li>Tap the <strong>menu icon</strong> (three dots or lines) at the corner of your screen.</li>
                <li>Select <strong>"Open in Browser"</strong>.</li>
              </ul>
            )}
          </div>

          <button 
            onClick={() => {
              const tempInput = document.createElement('input');
              tempInput.value = window.location.href;
              document.body.appendChild(tempInput);
              tempInput.select();
              document.execCommand('copy');
              document.body.removeChild(tempInput);
              alert('Link copied! Open Chrome or Safari and paste it.');
            }}
            className="mt-8 flex items-center justify-center w-full gap-2 px-6 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            Copy Link Instead
          </button>
        </div>
      </div>
    );
  }

  // If not in an in-app browser, render the app normally
  return <>{children}</>;
};
