import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const PWAInstallBanner = () => {
  const { showInstallBanner, canInstall, isIOS, installApp, dismissBanner } = usePWA();
  const navigate = useNavigate();

  const handleInstall = async () => {
    if (canInstall) {
      await installApp();
    } else {
      navigate('/install');
    }
  };

  if (!showInstallBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-lg mx-auto bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-2xl p-4 text-white">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-2 bg-white/20 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">Instala Ofiz</h3>
              <p className="text-sm text-white/80 mt-1">
                {isIOS 
                  ? 'Agrega Ofiz a tu pantalla de inicio para acceso rápido'
                  : 'Instala nuestra app para una mejor experiencia'
                }
              </p>
              
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleInstall}
                  className="bg-white text-primary hover:bg-white/90 gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isIOS ? 'Ver instrucciones' : 'Instalar'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={dismissBanner}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  Ahora no
                </Button>
              </div>
            </div>
            
            <button
              onClick={dismissBanner}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
