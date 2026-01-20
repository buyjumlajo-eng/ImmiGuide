export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Use relative path './sw.js' to ensure it resolves relative to the index.html
      // This fixes "Scope URL is not same-origin" errors when app is hosted in a subpath.
      const registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './' 
      });
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (e) {
      // Service Workers often fail in preview environments (iframe/different ports)
      // We log a warning instead of an error to prevent console noise.
      console.warn('Service Worker registration skipped (environment restriction):', e);
    }
  }
  return null;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn("This browser does not support desktop notifications");
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn("Notification permission request failed", e);
    return false;
  }
};

export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    // Try SW first for mobile support
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body
      });
    } else {
      // Fallback for standard web or if SW isn't ready
      try {
        new Notification(title, { 
          body, 
          icon: 'https://cdn-icons-png.flaticon.com/512/942/942748.png',
          silent: false 
        });
      } catch (e) {
        console.warn("Notification display failed", e);
      }
    }
  }
};

export const simulateCaseUpdate = () => {
    setTimeout(() => {
        sendNotification(
            "USCIS Case Status Update", 
            "Form I-130: Your case has been moved to 'Active Review'. Check the dashboard for details."
        );
    }, 5000);
};