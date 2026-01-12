import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Book, MessageSquare, FileText, Video, Mail, Phone, Clock, CheckCircle } from "lucide-react";
import { getArticleBySlug, getRelatedArticles } from "@/lib/helpArticles";
import { marked } from "marked";

// Configure marked for sync parsing
marked.setOptions({ async: false });

export default function HelpArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const article = slug ? getArticleBySlug(slug) : undefined;
  const relatedArticles = article ? getRelatedArticles(article) : [];

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-20">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold">Artículo no encontrado</h1>
            <p className="text-muted-foreground">El artículo que buscás no existe o fue movido.</p>
            <Button onClick={() => navigate('/help-center')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Centro de Ayuda
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Primeros Pasos": return <Book className="h-5 w-5" />;
      case "Comunicación": return <MessageSquare className="h-5 w-5" />;
      case "Pagos y Facturación": return <FileText className="h-5 w-5" />;
      case "Cuenta y Perfil": return <Video className="h-5 w-5" />;
      default: return <Book className="h-5 w-5" />;
    }
  };

  // Parse markdown content
  const htmlContent = marked.parse(article.content);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="container pt-8">
          <Breadcrumbs 
            items={[
              { label: "Centro de Ayuda", href: "/help-center" },
              { label: article.category, href: `/help-center#${article.categorySlug}` },
              { label: article.title }
            ]} 
          />
        </div>

        {/* Article Header */}
        <section className="py-12 border-b border-border/50">
          <div className="container max-w-4xl">
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => navigate('/help-center')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Centro de Ayuda
            </Button>
            
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                {getCategoryIcon(article.category)}
                {article.category}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                5 min de lectura
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {article.title}
            </h1>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12">
          <div className="container max-w-4xl">
            <div className="grid lg:grid-cols-[1fr_280px] gap-12">
              {/* Main Content */}
              <article 
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-li:text-muted-foreground
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                  prose-pre:bg-muted prose-pre:border prose-pre:border-border
                  prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
                  prose-hr:border-border"
                dangerouslySetInnerHTML={{ __html: marked.parse(article.content) as string }}
              />

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <Card className="border-border/50">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-semibold text-lg">Artículos relacionados</h3>
                      <ul className="space-y-3">
                        {relatedArticles.map((related) => (
                          <li key={related.slug}>
                            <Link 
                              to={`/ayuda/${related.slug}`}
                              className="text-sm text-primary hover:underline flex items-start gap-2"
                            >
                              <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" />
                              {related.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Help Box */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">¿Necesitás más ayuda?</h3>
                    <p className="text-sm text-muted-foreground">
                      Nuestro equipo de soporte está disponible para asistirte.
                    </p>
                    <div className="space-y-3">
                      <a 
                        href="mailto:soporte@ofiz.com" 
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        soporte@ofiz.com
                      </a>
                      <a 
                        href="tel:+59898817806" 
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        +598 98 817 806
                      </a>
                    </div>
                    <Button className="w-full" onClick={() => navigate('/contact')}>
                      Contactar Soporte
                    </Button>
                  </CardContent>
                </Card>

                {/* Feedback */}
                <Card className="border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold">¿Te fue útil este artículo?</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        👍 Sí
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        👎 No
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-muted/30 border-t border-border/50">
          <div className="container max-w-4xl">
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="p-8 text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-primary mx-auto" />
                <h2 className="text-2xl font-bold">¿Listo para comenzar?</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Registrate gratis y empezá a usar todas las funcionalidades de Ofiz hoy mismo.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button onClick={() => navigate('/auth')}>
                    Crear cuenta gratis
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/help-center')}>
                    Ver más artículos
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
