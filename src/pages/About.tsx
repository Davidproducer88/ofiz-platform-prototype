import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Heart, Zap, Users, Shield, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Confianza",
      description: "Construimos relaciones basadas en la transparencia y honestidad"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Eficiencia",
      description: "Simplificamos procesos para ahorrar tiempo a todos"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Comunidad",
      description: "Creamos un ecosistema donde todos ganan"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Seguridad",
      description: "Protegemos cada transacción y dato personal"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Usuarios Activos" },
    { number: "50,000+", label: "Trabajos Completados" },
    { number: "5,000+", label: "Profesionales Verificados" },
    { number: "4.9/5", label: "Calificación Promedio" }
  ];

  const team = [
    {
      name: "David Moreno Rivera",
      role: "CEO & Cofundador",
      bio: "Emprendedor con 10+ años de experiencia en tecnología y servicios"
    },
    {
      name: "Pedro Estrada",
      role: "CTO & Cofundador",
      bio: "Experto en desarrollo de plataformas y arquitectura de sistemas"
    },
    {
      name: "Matías Alderete",
      role: "COO & Cofundador",
      bio: "Especialista en operaciones y crecimiento de negocios digitales"
    },
    {
      name: "Martín Techera",
      role: "Head of Design",
      bio: "Diseñadora UX/UI apasionada por crear experiencias intuitivas"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
          <div className="container relative z-10">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                Sobre Ofiz
              </h1>
              <p className="text-xl text-muted-foreground">
                Conectamos personas con profesionales de confianza para transformar espacios y hacer realidad proyectos.
              </p>
            </div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="border-border/50 hover:shadow-elegant transition-all">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Nuestra Misión</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Democratizar el acceso a servicios profesionales de calidad, creando una plataforma 
                    donde clientes y profesionales puedan conectarse de forma simple, segura y eficiente. 
                    Queremos que cada hogar y oficina tenga acceso a los mejores profesionales, sin 
                    complicaciones ni intermediarios innecesarios.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:shadow-elegant transition-all">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10">
                    <TrendingUp className="h-8 w-8 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold">Nuestra Visión</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Ser la plataforma líder en América Latina para servicios profesionales, reconocida 
                    por su confiabilidad, innovación y compromiso con la excelencia. Aspiramos a crear 
                    un ecosistema donde profesionales independientes puedan prosperar y los clientes 
                    encuentren soluciones rápidas y confiables para sus necesidades.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Historia */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Nuestra Historia</h2>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-8 space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Ofiz nació en 2024 de la visión de un grupo de emprendedores que identificaron 
                  un problema común: la dificultad para encontrar profesionales confiables y la 
                  falta de herramientas para que los trabajadores independientes puedan desarrollar 
                  sus negocios. Durante su etapa de desarrollo hasta 2025, la plataforma alcanzó 
                  la madurez necesaria para convertirse en una solución profesional y confiable para 
                  conectar a clientes con especialistas verificados.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Comenzamos con un pequeño equipo en Montevideo, Uruguay, con el objetivo de 
                  crear una plataforma que pusiera la tecnología al servicio de las personas. 
                  Después de meses de desarrollo, entrevistas con cientos de profesionales y 
                  clientes, y múltiples iteraciones, lanzamos Ofiz.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Nuestra misión y visión es ganarnos la confianza de miles de personas para sus 
                  proyectos, estableciendo un estándar de excelencia en la conexión entre clientes 
                  y profesionales. Aspiramos a ser el puente confiable que facilite trabajos exitosos 
                  y contribuya al crecimiento profesional de los especialistas independientes, 
                  construyendo relaciones duraderas basadas en la calidad y transparencia.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Seguimos trabajando cada día para mejorar nuestra plataforma, añadir nuevas 
                  funcionalidades y expandirnos a nuevos mercados, siempre manteniendo nuestro 
                  compromiso con la calidad, seguridad y satisfacción de nuestra comunidad.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Valores */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Nuestros Valores</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Los principios que guían cada decisión que tomamos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="border-border/50 hover:shadow-elegant transition-all text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Estadísticas */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-background">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Nuestro Impacto</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="text-4xl md:text-5xl font-bold gradient-text">
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Equipo */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Nuestro Equipo</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Conocé a las personas que hacen posible Ofiz
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="border-border/50 hover:shadow-elegant transition-all">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto" />
                    <div>
                      <h3 className="text-xl font-semibold">{member.name}</h3>
                      <p className="text-sm text-primary">{member.role}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">Unite a Nuestra Comunidad</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Ya seas un cliente buscando servicios o un profesional queriendo crecer tu negocio, 
                  Ofiz es el lugar para vos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate('/auth')} className="shadow-elegant">
                    Comenzar Ahora
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                    Contactanos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
