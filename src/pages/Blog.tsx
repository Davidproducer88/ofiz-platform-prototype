import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFeaturedPost, getAllPosts } from "@/lib/blogData";

export default function Blog() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const featuredPost = getFeaturedPost();
  const posts = getAllPosts();

  const categories = ["Todos", "Guías", "Consejos", "Tendencias", "Finanzas", "Mantenimiento", "Seguridad", "Casos de Éxito"];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="container pt-8">
          <Breadcrumbs items={[{ label: "Blog" }]} />
        </div>

        {/* Hero Section */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
          <div className="container relative z-10">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                Blog de Ofiz
              </h1>
              <p className="text-xl text-muted-foreground">
                Consejos, guías y novedades para sacar el máximo provecho de la plataforma
              </p>
              
              {/* Search Bar */}
              <div className="flex gap-2 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar artículos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button>Buscar</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-16 md:py-24">
          <div className="container">
            <Card 
              className="border-border/50 hover:shadow-elegant transition-all cursor-pointer overflow-hidden"
              onClick={() => navigate(`/blog/${featuredPost.id}`)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full min-h-[300px] lg:min-h-[400px] object-cover" />
                <CardContent className="p-8 md:p-12 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary">{featuredPost.category}</Badge>
                    <span className="text-sm text-muted-foreground">{featuredPost.readTime} de lectura</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold">{featuredPost.title}</h2>
                  <p className="text-lg text-muted-foreground">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {featuredPost.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </div>
                  </div>
                  <Button className="w-fit">
                    Leer más
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>

        {/* Categories */}
        <section className="pb-16">
          <div className="container">
            <div className="flex gap-2 overflow-x-auto pb-4">
              {categories.map((category) => (
                <Button key={category} variant="outline" size="sm">
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="pb-16 md:pb-24">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <Card 
                  key={index} 
                  className="border-border/50 hover:shadow-elegant transition-all cursor-pointer overflow-hidden group"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  <img src={post.image} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.readTime} de lectura</span>
                    </div>
                    <h3 className="text-xl font-bold line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {post.author}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button size="lg" variant="outline">
                Cargar más artículos
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">Suscribite a nuestro blog</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Recibí los últimos artículos, consejos y novedades directamente en tu email
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input placeholder="tu@email.com" type="email" />
                  <Button className="shadow-elegant">Suscribirme</Button>
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
