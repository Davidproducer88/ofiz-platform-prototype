import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle, Share, Plus, MoreVertical, Chrome, Apple } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));
    
    // Check if already installed (standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);
    setIsInstalled(isInStandaloneMode);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const features = [
    {
      icon: Smartphone,
      title: 'Acceso Rápido',
      description: 'Abre Ofiz directamente desde tu pantalla de inicio'
    },
    {
      icon: Download,
      title: 'Funciona Offline',
      description: 'Accede a información básica sin conexión a internet'
    },
    {
      icon: CheckCircle,
      title: 'Notificaciones',
      description: 'Recibe alertas de nuevos mensajes y reservas'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Instala Ofiz en tu dispositivo</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Obtén acceso rápido a todos los servicios de Ofiz directamente desde tu pantalla de inicio
          </p>
        </div>

        {/* Already Installed */}
        {isInstalled && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="flex-shrink-0">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-green-800 dark:text-green-400">
                  ¡App instalada!
                </h3>
                <p className="text-green-700 dark:text-green-500">
                  Ofiz ya está instalado en tu dispositivo. Búscalo en tu pantalla de inicio.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Install Button (Chrome/Edge on Android) */}
        {deferredPrompt && !isInstalled && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  <Chrome className="w-12 h-12 text-primary" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-lg">Instalación rápida disponible</h3>
                  <p className="text-muted-foreground">
                    Haz clic en el botón para instalar Ofiz en tu dispositivo
                  </p>
                </div>
                <Button size="lg" onClick={handleInstall} className="gap-2">
                  <Download className="w-5 h-5" />
                  Instalar Ofiz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* iOS Instructions */}
        {isIOS && !isInstalled && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-6 h-6" />
                Instalar en iPhone / iPad
              </CardTitle>
              <CardDescription>
                Sigue estos pasos para agregar Ofiz a tu pantalla de inicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Share className="w-5 h-5 text-primary" />
                      Toca el botón Compartir
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Está en la parte inferior de Safari (cuadrado con flecha hacia arriba)
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Plus className="w-5 h-5 text-primary" />
                      Selecciona "Agregar a pantalla de inicio"
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Desplázate hacia abajo en el menú para encontrar esta opción
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Confirma tocando "Agregar"
                    </div>
                    <p className="text-muted-foreground text-sm">
                      ¡Listo! Ofiz aparecerá como una app en tu pantalla de inicio
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Android Instructions (fallback if no prompt) */}
        {isAndroid && !deferredPrompt && !isInstalled && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Chrome className="w-6 h-6" />
                Instalar en Android
              </CardTitle>
              <CardDescription>
                Sigue estos pasos para agregar Ofiz a tu pantalla de inicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <MoreVertical className="w-5 h-5 text-primary" />
                      Toca el menú del navegador
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Los tres puntos verticales en la esquina superior derecha de Chrome
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Plus className="w-5 h-5 text-primary" />
                      Selecciona "Instalar app" o "Agregar a pantalla de inicio"
                    </div>
                    <p className="text-muted-foreground text-sm">
                      La opción puede variar según tu versión de Chrome
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Confirma la instalación
                    </div>
                    <p className="text-muted-foreground text-sm">
                      ¡Listo! Ofiz aparecerá como una app en tu pantalla de inicio
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Message */}
        {!isIOS && !isAndroid && !isInstalled && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="py-6 text-center">
              <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-400 mb-2">
                Visita desde tu móvil
              </h3>
              <p className="text-blue-700 dark:text-blue-500">
                Para la mejor experiencia, abre esta página en tu smartphone y podrás instalar Ofiz como una app
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Install;
