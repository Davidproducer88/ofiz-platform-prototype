import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

export const PWAUpdatePrompt = () => {
  const { needRefresh, updateApp, setNeedRefresh } = usePWA();

  if (!needRefresh) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <div className="max-w-md mx-auto bg-blue-600 rounded-xl shadow-lg p-4 text-white flex items-center gap-4">
          <RefreshCw className="w-6 h-6 flex-shrink-0" />
          
          <div className="flex-1">
            <p className="font-medium">Nueva versión disponible</p>
            <p className="text-sm text-blue-100">Actualiza para obtener las últimas mejoras</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={updateApp}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Actualizar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setNeedRefresh(false)}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Después
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
