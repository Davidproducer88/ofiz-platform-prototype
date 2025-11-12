import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, ArrowLeft, Share2, BookmarkPlus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById } from "@/lib/blogData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<{ author: string; content: string; date: string }[]>([
    {
      author: "Laura Fernández",
      content: "Excelente artículo, muy útil y bien explicado. Me ayudó mucho para mi proyecto.",
      date: "Hace 2 días"
    },
    {
      author: "Martín Silva",
      content: "Información muy valiosa. Gracias por compartir estos consejos prácticos.",
      date: "Hace 5 días"
    }
  ]);

  const post = id ? getPostById(id) : undefined;

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Artículo no encontrado</h1>
            <Button onClick={() => navigate("/blog")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al blog
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace del artículo se copió al portapapeles",
      });
    }
  };

  const handleSave = () => {
    toast({
      title: "Artículo guardado",
      description: "El artículo se guardó en tus favoritos",
    });
  };

  const handleSubmitComment = () => {
    if (comment.trim()) {
      setComments([
        {
          author: "Usuario Anónimo",
          content: comment,
          date: "Ahora"
        },
        ...comments
      ]);
      setComment("");
      toast({
        title: "Comentario publicado",
        description: "Tu comentario ha sido publicado exitosamente",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumbs */}
        <section className="py-8 border-b border-border">
          <div className="container">
            <Breadcrumbs items={[
              { label: "Blog", href: "/blog" },
              { label: post.title }
            ]} />
          </div>
        </section>

        {/* Article Header */}
        <section className="py-12 md:py-16">
          <div className="container max-w-4xl">
            <div className="space-y-6">
              <Badge variant="secondary" className="text-sm">{post.category}</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {post.title}
              </h1>
              <p className="text-xl text-muted-foreground">{post.excerpt}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.author}
                </div>
                <div className="flex items-center gap-2">
                  {post.readTime} de lectura
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="py-8">
          <div className="container max-w-4xl">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-[400px] md:h-[500px] object-cover rounded-lg shadow-elegant"
            />
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12">
          <div className="container max-w-3xl">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <p className="lead text-xl text-foreground/80 mb-8">{post.content.intro}</p>
              
              {post.content.sections.map((section, index) => (
                <div key={index} className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">{section.title}</h2>
                  <p className="text-lg text-foreground/80 leading-relaxed">{section.content}</p>
                </div>
              ))}

              <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                <p className="text-lg font-medium text-foreground">{post.content.conclusion}</p>
              </div>
            </article>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-3xl">
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">¿Listo para tu proyecto?</h2>
                <p className="text-lg text-muted-foreground">
                  Conecta con profesionales verificados en Ofiz y transforma tu hogar hoy mismo
                </p>
                <Button size="lg" className="shadow-elegant" onClick={() => navigate("/search-masters")}>
                  Encontrar profesionales
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Comments Section */}
        <section className="py-16">
          <div className="container max-w-3xl">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Comentarios</h2>
                <p className="text-muted-foreground">{comments.length} comentarios</p>
              </div>

              <Separator />

              {/* Comment Form */}
              <Card className="border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Dejá tu comentario</h3>
                  <Textarea
                    placeholder="Comparte tu opinión sobre este artículo..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button onClick={handleSubmitComment}>Publicar comentario</Button>
                </CardContent>
              </Card>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {comment.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{comment.author}</h4>
                            <span className="text-sm text-muted-foreground">{comment.date}</span>
                          </div>
                          <p className="text-foreground/80">{comment.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
