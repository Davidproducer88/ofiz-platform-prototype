import jsPDF from 'jspdf';

export const generateClientGuidePDF = () => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(41, 128, 185);
  doc.text('Guía Completa para Clientes', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Todo lo que necesitás saber como cliente en Ofiz', 20, 40);
  
  doc.setDrawColor(41, 128, 185);
  doc.line(20, 45, 190, 45);
  
  // Section 1
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('1. Cómo Crear una Cuenta', 20, 60);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section1 = [
    '• Visitá ofiz.com y hacé clic en "Registrarme"',
    '• Completá tus datos: nombre, email y contraseña',
    '• Verificá tu email haciendo clic en el enlace que te enviamos',
    '• ¡Listo! Ya podés comenzar a usar Ofiz'
  ];
  section1.forEach((line, i) => doc.text(line, 25, 70 + (i * 7)));
  
  // Section 2
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('2. Publicar tu Primer Encargo', 20, 105);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section2 = [
    '• Iniciá sesión y hacé clic en "Publicar Encargo"',
    '• Seleccioná la categoría del servicio que necesitás',
    '• Describí detalladamente el trabajo a realizar',
    '• Agregá fotos si es necesario para mejor comprensión',
    '• Indicá tu presupuesto estimado y fecha deseada',
    '• Publicá y esperá propuestas de profesionales'
  ];
  section2.forEach((line, i) => doc.text(line, 25, 115 + (i * 7)));
  
  // Section 3
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('3. Elegir al Profesional Ideal', 20, 165);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section3 = [
    '• Revisá las calificaciones y reseñas de cada profesional',
    '• Compará los presupuestos recibidos',
    '• Usá el chat para hacer preguntas antes de decidir',
    '• Verificá su portafolio de trabajos anteriores',
    '• Elegí al que mejor se adapte a tus necesidades'
  ];
  section3.forEach((line, i) => doc.text(line, 25, 175 + (i * 7)));
  
  // Section 4
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('4. Pagos Seguros', 20, 220);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section4 = [
    '• Todos los pagos se realizan a través de Mercado Pago',
    '• Tu dinero queda protegido hasta confirmar el trabajo',
    '• Podés pagar con tarjeta, transferencia o efectivo',
    '• Recibís comprobante de cada transacción'
  ];
  section4.forEach((line, i) => doc.text(line, 25, 230 + (i * 7)));
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('© 2025 Ofiz - Todos los derechos reservados', 20, 280);
  doc.text('www.ofiz.com | soporte@ofiz.com', 20, 286);
  
  doc.save('guia-completa-clientes-ofiz.pdf');
};

export const generateProfessionalManualPDF = () => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(46, 204, 113);
  doc.text('Manual del Profesional', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Cómo maximizar tus oportunidades en Ofiz', 20, 40);
  
  doc.setDrawColor(46, 204, 113);
  doc.line(20, 45, 190, 45);
  
  // Section 1
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('1. Configurar tu Perfil Profesional', 20, 60);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section1 = [
    '• Completá todos los campos de tu perfil al 100%',
    '• Subí una foto profesional de alta calidad',
    '• Describí tus servicios de forma clara y detallada',
    '• Agregá tu experiencia y certificaciones',
    '• Definí tus tarifas de forma competitiva'
  ];
  section1.forEach((line, i) => doc.text(line, 25, 70 + (i * 7)));
  
  // Section 2
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('2. Construir tu Portafolio', 20, 115);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section2 = [
    '• Subí fotos de tus mejores trabajos realizados',
    '• Incluí descripciones de cada proyecto',
    '• Mostrá el antes y después cuando sea posible',
    '• Actualizá regularmente con nuevos trabajos',
    '• Organizá por categorías de servicio'
  ];
  section2.forEach((line, i) => doc.text(line, 25, 125 + (i * 7)));
  
  // Section 3
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('3. Postularte a Trabajos', 20, 170);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section3 = [
    '• Revisá diariamente los nuevos encargos disponibles',
    '• Postulate solo a trabajos que podés realizar bien',
    '• Escribí mensajes personalizados para cada cliente',
    '• Ofrecé presupuestos justos y competitivos',
    '• Respondé rápido para aumentar tus chances'
  ];
  section3.forEach((line, i) => doc.text(line, 25, 180 + (i * 7)));
  
  // Section 4
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('4. Gestionar tus Finanzas', 20, 225);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section4 = [
    '• Tus ganancias se acumulan en tu balance de Ofiz',
    '• Podés retirar a tu cuenta de Mercado Pago',
    '• Llevá un registro de todos tus ingresos',
    '• Usá el panel de analytics para optimizar'
  ];
  section4.forEach((line, i) => doc.text(line, 25, 235 + (i * 7)));
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('© 2025 Ofiz - Todos los derechos reservados', 20, 280);
  doc.text('www.ofiz.com | soporte@ofiz.com', 20, 286);
  
  doc.save('manual-profesional-ofiz.pdf');
};

export const generateBestPracticesPDF = () => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(155, 89, 182);
  doc.text('Mejores Prácticas en Ofiz', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Tips y consejos de nuestra comunidad', 20, 40);
  
  doc.setDrawColor(155, 89, 182);
  doc.line(20, 45, 190, 45);
  
  // Section 1
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Para Clientes', 20, 60);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section1 = [
    '• Sé claro y específico al describir el trabajo',
    '• Incluí fotos del problema o área de trabajo',
    '• Establecé un presupuesto realista',
    '• Respondé rápido a los mensajes de profesionales',
    '• Dejá una reseña honesta después del servicio',
    '• Mantené toda la comunicación dentro de Ofiz'
  ];
  section1.forEach((line, i) => doc.text(line, 25, 70 + (i * 7)));
  
  // Section 2
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Para Profesionales', 20, 120);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section2 = [
    '• Respondé a las solicitudes en menos de 2 horas',
    '• Sé puntual en todas tus citas',
    '• Comunicá cualquier cambio o imprevisto',
    '• Llevá tus propias herramientas y materiales',
    '• Dejá el área de trabajo limpia al terminar',
    '• Pedí feedback al cliente para mejorar'
  ];
  section2.forEach((line, i) => doc.text(line, 25, 130 + (i * 7)));
  
  // Section 3
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Comunicación Efectiva', 20, 180);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section3 = [
    '• Usá un tono profesional y respetuoso',
    '• Confirmá todos los detalles por escrito',
    '• Evitá compartir información personal fuera de Ofiz',
    '• Reportá cualquier comportamiento inapropiado'
  ];
  section3.forEach((line, i) => doc.text(line, 25, 190 + (i * 7)));
  
  // Section 4
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Seguridad y Pagos', 20, 225);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const section4 = [
    '• Siempre usá el sistema de pagos de Ofiz',
    '• No aceptes pagos en efectivo fuera de la plataforma',
    '• Verificá la identidad antes de ir a un domicilio',
    '• Reportá cualquier intento de fraude'
  ];
  section4.forEach((line, i) => doc.text(line, 25, 235 + (i * 7)));
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('© 2025 Ofiz - Todos los derechos reservados', 20, 280);
  doc.text('www.ofiz.com | soporte@ofiz.com', 20, 286);
  
  doc.save('mejores-practicas-ofiz.pdf');
};
