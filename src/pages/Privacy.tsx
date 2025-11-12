import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
export default function Privacy() {
  return <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
          <div className="container relative z-10">
            {/* Breadcrumbs */}
            <div className="mb-8">
              <Breadcrumbs items={[{ label: "Política de Privacidad" }]} />
            </div>

            <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                Política de Privacidad
              </h1>
              <p className="text-muted-foreground">Última actualización: Octubre 2025</p>
            </div>

            <Card className="max-w-4xl mx-auto border-border/50">
              <CardContent className="p-8 md:p-12 space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">1. Introducción</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    En Ofiz respetamos tu privacidad y estamos comprometidos a proteger tus datos personales. 
                    Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos tu 
                    información cuando usás nuestra plataforma.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">2. Información que Recopilamos</h2>
                  <div className="text-muted-foreground space-y-3 leading-relaxed">
                    <p><strong>Información que proporcionás directamente:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Nombre completo, email y número de teléfono</li>
                      <li>Dirección y ubicación geográfica</li>
                      <li>Información de pago y facturación</li>
                      <li>Fotos de perfil y trabajos realizados</li>
                      <li>Mensajes y comunicaciones en la plataforma</li>
                      <li>Calificaciones y reseñas</li>
                    </ul>
                    <p className="mt-3"><strong>Información recopilada automáticamente:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Dirección IP y ubicación aproximada</li>
                      <li>Tipo de dispositivo y navegador</li>
                      <li>Páginas visitadas y acciones en la plataforma</li>
                      <li>Fecha y hora de acceso</li>
                      <li>Cookies y tecnologías similares</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">3. Cómo Usamos Tu Información</h2>
                  <div className="text-muted-foreground space-y-2 leading-relaxed">
                    <p>Utilizamos tu información para:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Proporcionar y mejorar nuestros servicios</li>
                      <li>Facilitar la conexión entre clientes y profesionales</li>
                      <li>Procesar pagos y transacciones</li>
                      <li>Enviar notificaciones sobre tu cuenta y actividad</li>
                      <li>Detectar y prevenir fraudes</li>
                      <li>Cumplir con obligaciones legales</li>
                      <li>Realizar análisis y estadísticas (de forma anónima)</li>
                      <li>Enviar comunicaciones de marketing (con tu consentimiento)</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">4. Compartir Tu Información</h2>
                  <div className="text-muted-foreground space-y-2 leading-relaxed">
                    <p>Compartimos tu información únicamente en los siguientes casos:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Con otros usuarios:</strong> Tu perfil público es visible para facilitar las conexiones</li>
                      <li><strong>Con proveedores de servicios:</strong> Empresas que nos ayudan a operar la plataforma (procesadores de pago, hosting, etc.)</li>
                      <li><strong>Por obligación legal:</strong> Si es requerido por ley o para proteger nuestros derechos</li>
                      <li><strong>En caso de fusión o adquisición:</strong> Tu información puede ser transferida a la nueva entidad</li>
                    </ul>
                    <p className="mt-2"><strong>Nunca vendemos tu información personal a terceros.</strong></p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">5. Seguridad de los Datos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información 
                    contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Encriptación de datos en tránsito y en reposo</li>
                    <li>Controles de acceso estrictos</li>
                    <li>Auditorías de seguridad regulares</li>
                    <li>Servidores seguros y certificados</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">6. Cookies y Tecnologías Similares</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Usamos cookies y tecnologías similares para mejorar tu experiencia, recordar tus preferencias y 
                    analizar el uso de la plataforma. Podés configurar tu navegador para rechazar cookies, pero esto 
                    puede afectar la funcionalidad de algunos servicios.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">7. Tus Derechos</h2>
                  <div className="text-muted-foreground space-y-2 leading-relaxed">
                    <p>Tenés derecho a:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Acceder</strong> a tu información personal</li>
                      <li><strong>Rectificar</strong> datos incorrectos o incompletos</li>
                      <li><strong>Eliminar</strong> tu cuenta y datos (sujeto a obligaciones legales)</li>
                      <li><strong>Oponerte</strong> al procesamiento de tus datos</li>
                      <li><strong>Portabilidad</strong> de tus datos a otra plataforma</li>
                      <li><strong>Retirar el consentimiento</strong> para comunicaciones de marketing</li>
                    </ul>
                    <p className="mt-2">Para ejercer estos derechos, contactanos en legal@ofiz.com.uy</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">8. Retención de Datos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Retenemos tu información personal mientras tu cuenta esté activa o según sea necesario para 
                    proporcionar servicios. También podemos retener y usar tu información para cumplir con obligaciones 
                    legales, resolver disputas y hacer cumplir nuestros acuerdos.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">9. Privacidad de Menores</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Nuestros servicios están destinados a personas mayores de 18 años. No recopilamos intencionalmente 
                    información de menores de edad. Si descubrimos que hemos recopilado información de un menor, 
                    la eliminaremos de inmediato.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">10. Enlaces a Sitios de Terceros</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Nuestra plataforma puede contener enlaces a sitios web de terceros. No somos responsables de las 
                    prácticas de privacidad de estos sitios. Te recomendamos leer sus políticas de privacidad.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">11. Transferencias Internacionales</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Tu información puede ser transferida y procesada en países fuera de Uruguay. Cuando hacemos esto, 
                    nos aseguramos de que se implementen las medidas de protección adecuadas de acuerdo con las 
                    leyes aplicables.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">12. Cambios a Esta Política</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios 
                    significativos por email o mediante un aviso destacado en la plataforma. La fecha de "Última 
                    actualización" al inicio de esta política indica cuándo fue modificada por última vez.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">13. Contacto</h2>
                  <div className="text-muted-foreground leading-relaxed space-y-2">
                    <p>Si tenés preguntas o inquietudes sobre esta Política de Privacidad, contactanos en:</p>
                    <ul className="list-none space-y-1">
                      <li>Email: legal@ofiz.com.uy</li>
                      <li>Teléfono: +598 98 817 806</li>
                      <li>Dirección: Montevideo, Uruguay</li>
                    </ul>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
}