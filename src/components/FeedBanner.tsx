import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Users, Heart, Share2, TrendingUp, ArrowRight, Target } from 'lucide-react';
export const FeedBanner = () => {
  const navigate = useNavigate();
  const {
    profile
  } = useAuth();
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
  return <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }} />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-hero text-white rounded-full mb-6 animate-fade-in shadow-elegant">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-semibold"> Ofiz Open Feed</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-6 animate-fade-in" style={{
            animationDelay: '0.1s'
          }}>
               Tu Central de Oportunidades en Tiempo Real
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>Descubrí        <span className="text-primary font-semibold">solicitudes de trabajo activas</span>, profesionales disponibles y contenidos personalizados. <span className="text-accent font-semibold">¡Todo en un solo lugar!</span>
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-primary/50 transition-smooth hover:shadow-elegant animate-fade-in bg-gradient-to-br from-card to-card/50 backdrop-blur-sm group" style={{
            animationDelay: '0.3s'
          }}>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">🤝 +10,000 Miembros Activos</h3>
                <p className="text-sm text-muted-foreground">
                  Conectate con profesionales certificados y clientes reales verificados en tu zona
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-smooth hover:shadow-elegant animate-fade-in bg-gradient-to-br from-card to-card/50 backdrop-blur-sm group" style={{
            animationDelay: '0.4s'
          }}>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary-hover rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft group-hover:scale-110 transition-transform">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">🎯 100% Personalizado</h3>
                <p className="text-sm text-muted-foreground">
                  Contenido y oportunidades adaptadas según tus intereses y ubicación
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-smooth hover:shadow-elegant animate-fade-in bg-gradient-to-br from-card to-card/50 backdrop-blur-sm group" style={{
            animationDelay: '0.5s'
          }}>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent-hover rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">📈 Actualizaciones en Vivo</h3>
                <p className="text-sm text-muted-foreground">
                  Las mejores ofertas, profesionales destacados y trabajos disponibles ahora mismo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button size="xl" onClick={handleExploreClick} className="gap-2 shadow-elegant hover:shadow-soft transition-smooth group text-base px-8">
                <Share2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Explorar Open Feed Ahora
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {!profile && <Button variant="outline" size="xl" onClick={() => navigate('/auth')} className="gap-2 text-base px-8 border-2">
                  Registrarme GRATIS
                </Button>}
            </div>
            
            <p className="text-sm text-muted-foreground animate-fade-in" style={{
            animationDelay: '0.6s'
          }}>
              ✨ Más de <span className="text-primary font-semibold">10,000 profesionales y clientes</span> ya están conectados
            </p>
          </div>
        </div>
      </div>
    </section>;
};