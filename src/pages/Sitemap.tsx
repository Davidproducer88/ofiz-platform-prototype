import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { blogPosts } from "@/lib/blogData";
import { 
  Home, 
  Search, 
  HelpCircle, 
  DollarSign, 
  Shield, 
  Info, 
  Mail, 
  FileText, 
  Lock,
  BookOpen,
  Briefcase,
  PresentationIcon
} from "lucide-react";

const Sitemap = () => {
  const sections = [
    {
      title: "Principal",
      icon: Home,
      links: [
        { path: "/", label: "Inicio" },
        { path: "/search-masters", label: "Buscar Profesionales" },
      ]
    },
    {
      title: "Información",
      icon: Info,
      links: [
        { path: "/how-it-works", label: "Cómo Funciona" },
        { path: "/pricing", label: "Precios" },
        { path: "/guarantees", label: "Garantías" },
        { path: "/about", label: "Sobre Nosotros" },
      ]
    },
    {
      title: "Soporte",
      icon: HelpCircle,
      links: [
        { path: "/help-center", label: "Centro de Ayuda" },
        { path: "/contact", label: "Contacto" },
      ]
    },
    {
      title: "Blog",
      icon: BookOpen,
      links: [
        { path: "/blog", label: "Todos los Artículos" },
        ...blogPosts.map(post => ({
          path: `/blog/${post.id}`,
          label: post.title,
          category: post.category
        }))
      ]
    },
    {
      title: "Recursos",
      icon: Briefcase,
      links: [
        { path: "/dossier-maestros", label: "Dossier Maestros" },
        { path: "/dossier-empresas", label: "Dossier Empresas" },
        { path: "/pitch-deck", label: "Pitch Deck" },
      ]
    },
    {
      title: "Legal",
      icon: FileText,
      links: [
        { path: "/terms", label: "Términos y Condiciones" },
        { path: "/privacy", label: "Política de Privacidad" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Mapa del Sitio</h1>
            <p className="text-muted-foreground text-lg">
              Navegá fácilmente por todas las secciones de Ofiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="bg-card rounded-lg p-6 border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">{section.title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className="text-muted-foreground hover:text-primary transition-colors flex items-start group"
                        >
                          <span className="mr-2 mt-1.5 w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors flex-shrink-0" />
                          <span className="flex-1">
                            {link.label}
                            {'category' in link && (
                              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                                {link.category}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-6 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              ¿No encontrás lo que buscás?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contactanos
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sitemap;
