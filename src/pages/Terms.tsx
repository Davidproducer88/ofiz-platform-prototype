import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
export default function Terms() {
  return <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
          <div className="container relative z-10">
            {/* Breadcrumbs */}
            <div className="mb-8">
              <Breadcrumbs items={[{ label: "Términos y Condiciones" }]} />
            </div>

            <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                Términos y Condiciones
              </h1>
              <p className="text-muted-foreground">Última actualización: Octubre 2025</p>
            </div>

            <Card className="max-w-4xl mx-auto border-border/50">
              <CardContent className="p-8 md:p-12 space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">1. Aceptación de los Términos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Al acceder y utilizar la plataforma Ofiz, aceptás estar sujeto a estos Términos y Condiciones. 
                    Si no estás de acuerdo con alguna parte de estos términos, no podrás utilizar nuestros servicios.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">2. Descripción del Servicio</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Ofiz es una plataforma que conecta clientes con profesionales independientes para la prestación 
                    de servicios. Actuamos como intermediarios facilitando la comunicación, coordinación y pago entre 
                    las partes.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">3. Registro y Cuenta</h2>
                  <div className="text-muted-foreground space-y-2 leading-relaxed">
                    <p>Para utilizar Ofiz debés:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Ser mayor de 18 años</li>
                      <li>Proporcionar información precisa y actualizada</li>
                      <li>Mantener la confidencialidad de tu cuenta</li>
                      <li>Notificar inmediatamente cualquier uso no autorizado</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">4. Obligaciones de los Usuarios</h2>
                  <div className="text-muted-foreground space-y-3 leading-relaxed">
                    <p><strong>Para Clientes:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Proporcionar información clara y precisa sobre los trabajos</li>
                      <li>Pagar los servicios acordados en tiempo y forma</li>
                      <li>Tratar con respeto a los profesionales</li>
                      <li>Confirmar o reportar problemas dentro de los plazos establecidos</li>
                    </ul>
                    <p className="mt-3"><strong>Para Profesionales:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Completar los trabajos según lo acordado</li>
                      <li>Mantener los más altos estándares de calidad</li>
                      <li>Comunicarse de manera profesional con los clientes</li>
                      <li>Cumplir con todas las regulaciones aplicables a su oficio</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">5. Pagos y Comisiones</h2>
                  <div className="text-muted-foreground space-y-2 leading-relaxed">
                    <p>Ofiz cobra una comisión del 5% sobre cada transacción completada. Los pagos se procesan de forma segura y el dinero se retiene hasta que el cliente confirme la finalización del trabajo.</p>
                    <p>Los profesionales Premium tienen una comisión reducida del 3%.</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">6. Cancelaciones y Reembolsos</h2>
                  <div className="text-muted-foreground space-y-2 leading-relaxed">
                    <p>Las cancelaciones están sujetas a las siguientes condiciones:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Cancelación con más de 48hs: Reembolso completo</li>
                      <li>Cancelación entre 24-48hs: Reembolso del 50%</li>
                      <li>Cancelación con menos de 24hs: Sin reembolso</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">7. Propiedad Intelectual</h2>
                  <p className="text-muted-foreground leading-relaxed">Todo el contenido de Ofiz, incluyendo diseños, logos, textos y código, es propiedad de Orbital Estudio o sus licenciantes. No podés copiar, modificar o distribuir nuestro contenido sin autorización.</p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">8. Limitación de Responsabilidad</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Ofiz actúa únicamente como intermediario. No somos responsables de la calidad de los servicios 
                    prestados, daños a la propiedad, lesiones o cualquier otro problema que surja de la interacción 
                    entre clientes y profesionales. Sin embargo, ofrecemos mecanismos de mediación para resolver disputas.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">9. Resolución de Disputas</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    En caso de disputas entre usuarios, Ofiz ofrecerá servicios de mediación. Si la mediación no tiene 
                    éxito, las partes aceptan someter las disputas a arbitraje vinculante de acuerdo con las leyes de Uruguay.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">10. Modificaciones</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios se 
                    publicarán en esta página y, si son significativos, te notificaremos por email. El uso continuo 
                    de la plataforma después de los cambios constituye la aceptación de los nuevos términos.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">11. Terminación</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Podemos suspender o terminar tu cuenta si violás estos términos, participás en actividades 
                    fraudulentas o ilegales, o si determinamos que tu comportamiento es perjudicial para la plataforma 
                    o sus usuarios.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">12. Ley Aplicable</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Estos términos se regirán e interpretarán de acuerdo con las leyes de Uruguay, sin dar efecto 
                    a ningún principio de conflicto de leyes.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold">13. Contacto</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Para cualquier pregunta sobre estos Términos y Condiciones, contactanos en legal@ofiz.com
                  </p>
                </section>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
}