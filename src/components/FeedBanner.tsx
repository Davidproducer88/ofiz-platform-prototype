import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Users, 
  Heart, 
  Share2, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const FeedBanner = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleExploreClick = () => {
    if (profile) {
      // Redirigir al dashboard correspondiente según el tipo de usuario
      switch (profile.user_type) {
        case 'client':
          navigate('/client-dashboard');
          break;
        case 'master':
          navigate('/master-dashboard');
          break;
        case 'business':
          navigate('/business-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/auth');
      }
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 animate-fade-in">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">Nuevo: Ofiz Open Feed</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Descubre una Nueva Forma de Conectar
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Únete a nuestra comunidad social donde maestros y clientes comparten experiencias, 
              descubren servicios y construyen confianza en tiempo real.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-primary/50 transition-smooth hover:shadow-elegant animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Comunidad Activa</h3>
                <p className="text-sm text-muted-foreground">
                  Conéctate con profesionales verificados y clientes reales de toda tu ciudad
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-smooth hover:shadow-elegant animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Contenido Personalizado</h3>
                <p className="text-sm text-muted-foreground">
                  Descubre servicios, proyectos y maestros según tus intereses y necesidades
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-smooth hover:shadow-elegant animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Tendencias en Vivo</h3>
                <p className="text-sm text-muted-foreground">
                  Mantente al día con los servicios más populares y las mejores ofertas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button 
                size="lg" 
                onClick={handleExploreClick}
                className="gap-2 shadow-elegant hover:shadow-glow transition-smooth group"
              >
                <Share2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Explorar Open Feed
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {!profile && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="gap-2"
                >
                  Crear Cuenta Gratis
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
              ✨ Únete a más de 1,000 profesionales y clientes activos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
