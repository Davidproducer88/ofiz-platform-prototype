import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, conversationId, senderId } = await req.json();
    console.log('Filtering message:', { conversationId, senderId, contentLength: content.length });

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar si el usuario está suspendido o baneado
    const { data: userWarning } = await supabase
      .from('user_warnings')
      .select('*')
      .eq('user_id', senderId)
      .single();

    if (userWarning) {
      if (userWarning.permanently_banned) {
        return new Response(JSON.stringify({
          allowed: false,
          reason: 'Usuario permanentemente baneado',
          severity: 'critical'
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (userWarning.suspended_until && new Date(userWarning.suspended_until) > new Date()) {
        return new Response(JSON.stringify({
          allowed: false,
          reason: 'Usuario temporalmente suspendido',
          severity: 'high',
          suspended_until: userWarning.suspended_until
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Patrones de detección básica (regex)
    const patterns = {
      phone: /(\+?598\s?)?([0-9]{3,4}[-\s]?[0-9]{3,4}|[0-9]{8,9})|(\+?[0-9]{1,3}[-\s]?)?(\()?[0-9]{2,4}(\))?[-\s]?[0-9]{3,4}[-\s]?[0-9]{3,4}/gi,
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
      whatsapp: /whatsapp|wsp|wpp|what\s?s?app/gi,
      instagram: /instagram|insta|ig:|@[a-zA-Z0-9._]{1,30}/gi,
      facebook: /facebook|fb|face/gi,
      telegram: /telegram|tg:/gi,
      externalContact: /llamam[eé]|llamar|ll[aá]mame|contacto|contactame|fuera|exterior|aparte/gi
    };

    // Detección básica con regex
    const detectedPatterns: any = {};
    let hasViolation = false;
    let violationType = '';
    let severity = 'low';

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        detectedPatterns[type] = matches;
        hasViolation = true;
        
        // Determinar tipo y severidad
        if (type === 'phone' || type === 'email') {
          violationType = type;
          severity = 'critical';
        } else if (type === 'whatsapp' || type === 'telegram') {
          violationType = 'social_media';
          severity = 'high';
        } else if (type === 'externalContact') {
          violationType = 'external_contact';
          severity = 'medium';
        }
      }
    }

    // Usar IA para análisis más profundo si hay sospecha
    let aiAnalysis = null;
    if (hasViolation || content.length > 50) {
      try {
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        console.log('Using AI analysis for deeper inspection');

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `Eres un sistema de seguridad que detecta intentos de compartir información de contacto o evasión de plataforma. 
                
Analiza el siguiente mensaje y determina:
1. Si contiene números telefónicos (Uruguay o internacional)
2. Si contiene emails
3. Si menciona redes sociales (WhatsApp, Instagram, Facebook, Telegram)
4. Si intenta coordinar comunicación fuera de la plataforma
5. Si usa técnicas de evasión (números con espacios, letras sustituidas, etc.)

Responde SOLO con un JSON con este formato:
{
  "violation": boolean,
  "type": "phone"|"email"|"social_media"|"external_contact"|"suspicious"|"none",
  "severity": "low"|"medium"|"high"|"critical",
  "confidence": number (0-100),
  "detected_info": string[],
  "reason": string
}`
              },
              { role: 'user', content: `Mensaje a analizar: "${content}"` }
            ],
            temperature: 0.2,
            max_tokens: 500
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiContent = aiData.choices[0].message.content;
          console.log('AI Response:', aiContent);
          
          // Limpiar el contenido de markdown si existe
          let jsonContent = aiContent.trim();
          if (jsonContent.startsWith('```json')) {
            jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
          } else if (jsonContent.startsWith('```')) {
            jsonContent = jsonContent.replace(/```\n?/g, '');
          }
          
          aiAnalysis = JSON.parse(jsonContent);
          
          // Si la IA detectó una violación más seria, actualizar
          if (aiAnalysis.violation && aiAnalysis.confidence > 70) {
            hasViolation = true;
            violationType = aiAnalysis.type;
            severity = aiAnalysis.severity;
            Object.assign(detectedPatterns, { ai_detected: aiAnalysis.detected_info });
          }
        }
      } catch (aiError) {
        console.error('AI Analysis error:', aiError);
        // Continuar sin análisis de IA si falla
      }
    }

    // Decidir acción
    let action = 'allowed';
    let censoredContent = content;
    let blockReason = '';

    if (hasViolation) {
      if (severity === 'critical' || severity === 'high') {
        action = 'blocked';
        blockReason = 'Intento de compartir información de contacto personal';
      } else if (severity === 'medium') {
        action = 'warned';
        blockReason = 'Contenido sospechoso detectado';
      }

      // Registrar violación
      await supabase.from('message_violations').insert({
        conversation_id: conversationId,
        sender_id: senderId,
        original_content: content,
        violation_type: violationType,
        detected_info: { patterns: detectedPatterns, ai_analysis: aiAnalysis },
        severity,
        action_taken: action
      });

      // Actualizar contador de advertencias
      const warningCount = (userWarning?.warning_count || 0) + 1;
      let suspendedUntil = null;
      let permanentlyBanned = false;

      // Sistema de sanciones progresivas
      if (warningCount >= 5) {
        permanentlyBanned = true;
      } else if (warningCount >= 3) {
        // Suspensión de 7 días
        suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (warningCount >= 2) {
        // Suspensión de 24 horas
        suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      await supabase
        .from('user_warnings')
        .upsert({
          user_id: senderId,
          warning_count: warningCount,
          last_warning_at: new Date().toISOString(),
          suspended_until: suspendedUntil,
          permanently_banned: permanentlyBanned
        }, { onConflict: 'user_id' });

      // Censurar contenido si es necesario
      if (action === 'warned') {
        // Reemplazar patrones detectados con [CENSURADO]
        censoredContent = content;
        for (const matches of Object.values(detectedPatterns)) {
          if (Array.isArray(matches)) {
            for (const match of matches) {
              censoredContent = censoredContent.replace(match, '[CENSURADO]');
            }
          }
        }
      }

      console.log('Violation detected:', { 
        action, 
        severity, 
        type: violationType, 
        warningCount,
        suspendedUntil,
        permanentlyBanned
      });
    }

    return new Response(JSON.stringify({
      allowed: action !== 'blocked',
      action,
      content: action === 'warned' ? censoredContent : content,
      blocked: action === 'blocked',
      censored: action === 'warned',
      block_reason: blockReason,
      violation_details: hasViolation ? {
        type: violationType,
        severity,
        detected: detectedPatterns
      } : null
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in filter-chat-message:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      allowed: true // Permitir en caso de error para no bloquear el chat
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});