// Facebook Messenger Customer Chat Widget
// Enables live chat support for Bulgarian customers
// Auto-loads in Bulgarian language

import { useEffect } from 'react';
import { useLanguage } from '@globul-cars/core/contextsLanguageContext';

interface FacebookMessengerWidgetProps {
  pageId?: string;
  themeColor?: string;
  greetingDialogDisplay?: 'show' | 'hide' | 'fade';
}

const FacebookMessengerWidget: React.FC<FacebookMessengerWidgetProps> = ({
  pageId,
  themeColor = '#005ca9',
  greetingDialogDisplay = 'fade'
}) => {
  const { language } = useLanguage();
  
  const defaultPageId = pageId || process.env.REACT_APP_FACEBOOK_PAGE_ID || '100080260449528';

  useEffect(() => {
    if (!defaultPageId) {
      console.warn('Facebook Page ID not configured');
      return;
    }

    // Load Facebook SDK
    window.fbAsyncInit = function() {
      if (window.FB) {
        window.FB.init({
          xfbml: true,
          version: 'v18.0'
        });
      }
    };

    // Insert Facebook SDK script
    const loadScript = () => {
      if (document.getElementById('facebook-jssdk')) return;

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://connect.facebook.net/${language === 'bg' ? 'bg_BG' : 'en_US'}/sdk/xfbml.customerchat.js`;
      
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      }
    };

    loadScript();

    // Cleanup
    return () => {
      const chatWidget = document.querySelector('.fb-customerchat');
      if (chatWidget && chatWidget.parentNode) {
        chatWidget.parentNode.removeChild(chatWidget);
      }
      
      const fbRoot = document.getElementById('fb-root');
      if (fbRoot && fbRoot.parentNode) {
        fbRoot.parentNode.removeChild(fbRoot);
      }
    };
  }, [defaultPageId, language]);

  // Bulgarian greetings
  const loggedInGreeting = language === 'bg'
    ? 'Здравейте! Как мога да ви помогна с автомобилите?'
    : 'Hello! How can I help you with cars?';
    
  const loggedOutGreeting = language === 'bg'
    ? 'Здравейте! Влезте във Facebook, за да чатите с нас.'
    : 'Hello! Log in to Facebook to chat with us.';

  return (
    <>
      <div id="fb-root"></div>
      <div
        className="fb-customerchat"
        data-page-id={defaultPageId}
        data-theme-color={themeColor}
        data-logged-in-greeting={loggedInGreeting}
        data-logged-out-greeting={loggedOutGreeting}
        data-greeting-dialog-display={greetingDialogDisplay}
      />
    </>
  );
};

export default FacebookMessengerWidget;

// Type declaration for FB SDK
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

