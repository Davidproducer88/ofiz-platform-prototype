import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Register service worker with auto-update
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  useEffect(() => {
    // Detect iOS
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check if already installed (standalone mode)
    const isInStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);
    setIsInstalled(isInStandaloneMode);

    // Check if user dismissed the banner recently
    const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');
    const dismissedTime = bannerDismissed ? parseInt(bannerDismissed, 10) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show banner if not installed and not dismissed in last 7 days
    if (!isInStandaloneMode && daysSinceDismissed > 7) {
      // Wait a bit before showing the banner
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallBanner(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during installation:', error);
      return false;
    } finally {
      setDeferredPrompt(null);
    }
  };

  const dismissBanner = () => {
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    setShowInstallBanner(false);
  };

  const updateApp = () => {
    updateServiceWorker(true);
  };

  return {
    isInstalled,
    isIOS,
    isStandalone,
    canInstall: !!deferredPrompt,
    showInstallBanner,
    needRefresh,
    installApp,
    dismissBanner,
    updateApp,
    setNeedRefresh,
  };
};
