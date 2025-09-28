import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  confirmation_url: string;
  user_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmation_url, user_name = "Usuario" }: VerificationEmailRequest = await req.json();

    console.log("Sending verification email to:", email);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "OFIZ <onboarding@resend.dev>",
        to: [email],
        subject: "Confirma tu cuenta en OFIZ",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirma tu cuenta - OFIZ</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f8fafc;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, hsl(260, 100%, 70%), hsl(185, 100%, 70%));
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, hsl(260, 100%, 70%), hsl(185, 100%, 70%));
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin: 20px 0;
              transition: all 0.3s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
            .footer {
              background-color: #f8fafc;
              padding: 20px 30px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
              border-top: 1px solid #e2e8f0;
            }
            .steps {
              background-color: #f8fafc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .step {
              display: flex;
              align-items: center;
              margin: 10px 0;
            }
            .step-number {
              background: linear-gradient(135deg, hsl(260, 100%, 70%), hsl(185, 100%, 70%));
              color: white;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              margin-right: 12px;
              flex-shrink: 0;
            }
            .security-info {
              background-color: #fef3c7;
              border: 1px solid #fbbf24;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
            }
            .security-info h3 {
              margin: 0 0 8px 0;
              color: #92400e;
              font-size: 16px;
            }
            .security-info p {
              margin: 0;
              color: #92400e;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a OFIZ!</h1>
              <p>Confirma tu cuenta para comenzar</p>
            </div>
            
            <div class="content">
              <h2>Hola ${user_name},</h2>
              <p>Gracias por registrarte en OFIZ, la plataforma que conecta a profesionales de servicios para el hogar con clientes que necesitan sus servicios.</p>
              
              <p>Para activar tu cuenta y comenzar a usar la plataforma, necesitas confirmar tu dirección de correo electrónico:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmation_url}" class="button">Confirmar mi cuenta</a>
              </div>
              
              <div class="steps">
                <h3 style="margin-top: 0; color: #374151;">Después de confirmar tu cuenta:</h3>
                <div class="step">
                  <div class="step-number">1</div>
                  <span>Completarás tu perfil con tus datos y foto</span>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <span>Podrás navegar por todos los servicios disponibles</span>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <span>Comenzarás a conectar con profesionales de confianza</span>
                </div>
              </div>
              
              <div class="security-info">
                <h3>🔒 Información de seguridad</h3>
                <p>Este enlace es único y expirará en 24 horas por tu seguridad. Si no fuiste tú quien se registró en OFIZ, puedes ignorar este correo.</p>
              </div>
              
              <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                <strong>¿Problemas para ver el botón?</strong> Copia y pega este enlace en tu navegador:<br>
                <span style="word-break: break-all; color: #3b82f6;">${confirmation_url}</span>
              </p>
            </div>
            
            <div class="footer">
              <p><strong>OFIZ</strong> - Conectando profesionales con hogares</p>
              <p>Este es un correo automático, no respondas a esta dirección.</p>
            </div>
          </div>
        </body>
        </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error: ${emailResponse.status} - ${errorText}`);
    }

    const responseData = await emailResponse.json();
    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Verification email sent successfully",
      email_id: responseData.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);