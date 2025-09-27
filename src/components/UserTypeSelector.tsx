import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Briefcase, 
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Clock
} from "lucide-react";

interface UserTypeSelectorProps {
  onSelect: (type: 'client' | 'master') => void;
}

export const UserTypeSelector = ({ onSelect }: UserTypeSelectorProps) => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-3xl font-bold gradient-text mb-4">Ofiz</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ¿Cómo querés usar Ofiz?
          </h1>
          <p className="text-xl text-muted-foreground">
            Elegí tu perfil para comenzar a disfrutar de nuestros servicios
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Client Option */}
          <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-primary/50">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform">
                <User className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">Soy Cliente</h3>
              <p className="text-muted-foreground">
                Necesito contratar servicios profesionales
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>Publicá encargos gratis</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>Recibí propuestas de profesionales</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>Pagos seguros con garantía</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  <span>Sistema de valoraciones confiable</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Ideal para</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="secondary">Propietarios</Badge>
                  <Badge variant="secondary">Empresas</Badge>
                  <Badge variant="secondary">Administradores</Badge>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full group"
                onClick={() => onSelect('client')}
              >
                Registrarme como Cliente
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Maestro Option */}
          <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-secondary/50">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 text-secondary mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">Soy Profesional</h3>
              <p className="text-muted-foreground">
                Quiero ofrecer mis servicios y conseguir clientes
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Perfil profesional verificado</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Acceso a encargos de tu zona</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Cobros seguros y puntuales</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Herramientas de gestión</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Especialidades</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="secondary">Plomería</Badge>
                  <Badge variant="secondary">Electricidad</Badge>
                  <Badge variant="secondary">Construcción</Badge>
                  <Badge variant="secondary">Y más...</Badge>
                </div>
              </div>

              <Button 
                size="lg" 
                variant="secondary"
                className="w-full group"
                onClick={() => onSelect('master')}
              >
                Registrarme como Maestro
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            ¿Ya tenés cuenta?{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Iniciar sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};