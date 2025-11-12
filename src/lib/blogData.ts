import choosingProfessionalImg from "@/assets/blog/choosing-professional.jpg";
import questionsHiringImg from "@/assets/blog/questions-hiring.jpg";
import homeTrendsImg from "@/assets/blog/home-trends-2025.jpg";
import budgetRenovationImg from "@/assets/blog/budget-renovation.jpg";
import preventiveMaintenanceImg from "@/assets/blog/preventive-maintenance.jpg";
import verifiedProfessionalsImg from "@/assets/blog/verified-professionals.jpg";
import successStoriesImg from "@/assets/blog/success-stories.jpg";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  image: string;
  readTime: string;
  content: {
    intro: string;
    sections: {
      title: string;
      content: string;
    }[];
    conclusion: string;
  };
}

export const blogPosts: BlogPost[] = [
  {
    id: "elegir-profesional-perfecto",
    title: "Cómo elegir el profesional perfecto para tu proyecto",
    excerpt: "Una guía completa con consejos prácticos para tomar la mejor decisión y asegurar el éxito de tu proyecto.",
    category: "Guías",
    date: "10 Mayo 2025",
    author: "Equipo Ofiz",
    image: choosingProfessionalImg,
    readTime: "8 min",
    content: {
      intro: "Elegir al profesional adecuado para tu proyecto es una decisión crucial que puede marcar la diferencia entre el éxito y el fracaso. En esta guía completa, te compartimos los aspectos más importantes a considerar.",
      sections: [
        {
          title: "Define claramente tu proyecto",
          content: "Antes de buscar un profesional, es fundamental que tengas claro qué necesitas. Define el alcance del trabajo, los materiales que deseas utilizar, y tu presupuesto aproximado. Cuanto más específico seas, más fácil será encontrar al profesional indicado."
        },
        {
          title: "Verifica las credenciales y experiencia",
          content: "Asegúrate de que el profesional tenga las certificaciones necesarias y experiencia comprobable en proyectos similares. Revisa su portfolio de trabajos anteriores y lee las reseñas de otros clientes. En Ofiz, todos nuestros profesionales pasan por un proceso de verificación riguroso."
        },
        {
          title: "Pide referencias y contacta clientes anteriores",
          content: "No dudes en pedir referencias de trabajos anteriores y contactar a esos clientes. Pregunta sobre la calidad del trabajo, la puntualidad, y si hubo algún problema durante la ejecución del proyecto. Las experiencias de otros clientes son invaluables."
        },
        {
          title: "Compara presupuestos de forma inteligente",
          content: "No te dejes llevar solo por el precio más bajo. Compara los presupuestos considerando la calidad de los materiales, los tiempos de entrega, las garantías ofrecidas, y la experiencia del profesional. A veces, pagar un poco más puede ahorrarte problemas futuros."
        }
      ],
      conclusion: "Tomarte el tiempo para elegir al profesional adecuado es una inversión que vale la pena. Con estos consejos y la plataforma de Ofiz, puedes encontrar profesionales verificados y calificados que transformarán tu proyecto en realidad."
    }
  },
  {
    id: "preguntas-antes-contratar",
    title: "10 preguntas que debés hacer antes de contratar",
    excerpt: "Las preguntas clave que te ayudarán a evaluar si un profesional es el indicado para tu proyecto.",
    category: "Consejos",
    date: "7 Mayo 2025",
    author: "María González",
    image: questionsHiringImg,
    readTime: "5 min",
    content: {
      intro: "Hacer las preguntas correctas antes de contratar a un profesional puede ahorrarte tiempo, dinero y dolores de cabeza. Aquí te presentamos las 10 preguntas esenciales que debes hacer.",
      sections: [
        {
          title: "1. ¿Cuál es tu experiencia en proyectos similares?",
          content: "Es importante saber si el profesional ha trabajado en proyectos como el tuyo. Pide ejemplos específicos y, si es posible, fotos de trabajos anteriores."
        },
        {
          title: "2. ¿Tienes las licencias y seguros necesarios?",
          content: "Verifica que el profesional tenga todas las certificaciones legales y un seguro de responsabilidad civil. Esto te protege en caso de accidentes o daños durante el trabajo."
        },
        {
          title: "3. ¿Cuánto tiempo tomará el proyecto?",
          content: "Obtén un cronograma realista del proyecto. Pregunta qué factores podrían causar retrasos y cómo se manejarían esas situaciones."
        },
        {
          title: "4. ¿Qué garantías ofreces sobre tu trabajo?",
          content: "Un profesional confiable debe ofrecer garantías sobre su trabajo y los materiales utilizados. Asegúrate de que estas garantías estén por escrito."
        }
      ],
      conclusion: "Estas preguntas te ayudarán a evaluar profesionalmente a cualquier candidato. Recuerda que en Ofiz, todos nuestros profesionales están verificados y listos para responder tus preguntas."
    }
  },
  {
    id: "tendencias-renovacion-2025",
    title: "Tendencias en renovación de hogares 2025",
    excerpt: "Descubrí las últimas tendencias en diseño, materiales y estilos para tu hogar este año.",
    category: "Tendencias",
    date: "4 Mayo 2025",
    author: "Carlos Rodríguez",
    image: homeTrendsImg,
    readTime: "6 min",
    content: {
      intro: "El 2025 trae consigo nuevas tendencias en diseño y renovación de hogares que combinan funcionalidad, sostenibilidad y estética. Descubre qué estilos están marcando la pauta este año.",
      sections: [
        {
          title: "Espacios multifuncionales",
          content: "Los hogares modernos requieren espacios que se adapten a múltiples usos. Las salas que funcionan como oficina, los dormitorios con zonas de trabajo integradas, y las cocinas que se convierten en espacios sociales son cada vez más populares."
        },
        {
          title: "Materiales sostenibles y naturales",
          content: "La conciencia ambiental sigue creciendo, y con ella la demanda de materiales ecológicos. Madera certificada, bambú, piedra natural y materiales reciclados están en el centro de las renovaciones modernas."
        },
        {
          title: "Tecnología integrada",
          content: "Los hogares inteligentes ya no son del futuro. Iluminación automatizada, sistemas de seguridad conectados y electrodomésticos inteligentes se están convirtiendo en estándar en las renovaciones."
        },
        {
          title: "Paletas de colores naturales",
          content: "Los tonos tierra, verdes suaves y azules apagados dominan las paletas de color. Estos colores crean ambientes relajantes y conectan los espacios interiores con la naturaleza."
        }
      ],
      conclusion: "Las tendencias de 2025 se centran en crear hogares que sean funcionales, sostenibles y hermosos. Sea cual sea tu estilo, en Ofiz encontrarás profesionales que pueden hacer realidad tu visión."
    }
  },
  {
    id: "maximizar-presupuesto-remodelacion",
    title: "Cómo maximizar tu presupuesto de remodelación",
    excerpt: "Tips prácticos para sacar el máximo provecho de tu inversión sin sacrificar calidad.",
    category: "Finanzas",
    date: "2 Mayo 2025",
    author: "Ana Martínez",
    image: budgetRenovationImg,
    readTime: "7 min",
    content: {
      intro: "Remodelar tu hogar no tiene que romper el banco. Con planificación inteligente y decisiones estratégicas, puedes lograr resultados increíbles sin gastar de más.",
      sections: [
        {
          title: "Prioriza las mejoras más impactantes",
          content: "Identifica qué cambios tendrán el mayor impacto visual y funcional. A menudo, renovar la cocina o el baño ofrece el mejor retorno de inversión y mejora significativamente la calidad de vida."
        },
        {
          title: "Reutiliza y recicla cuando sea posible",
          content: "No todo necesita ser nuevo. Considera restaurar muebles existentes, reutilizar materiales, o comprar artículos de segunda mano de calidad. Esto puede reducir significativamente los costos sin comprometer el resultado."
        },
        {
          title: "Programa tu proyecto estratégicamente",
          content: "Los precios de materiales y la disponibilidad de profesionales pueden variar según la temporada. Planificar tu proyecto en temporadas bajas puede resultar en ahorros significativos."
        },
        {
          title: "Haz algunas tareas tú mismo",
          content: "Evalúa qué trabajos puedes hacer por tu cuenta, como pintar, demoler o instalar accesorios simples. Esto te permitirá destinar más presupuesto a trabajos que realmente requieren un profesional."
        }
      ],
      conclusion: "Con estos consejos, puedes maximizar tu presupuesto de remodelación sin sacrificar calidad. En Ofiz, te conectamos con profesionales que te ayudarán a encontrar soluciones creativas dentro de tu presupuesto."
    }
  },
  {
    id: "mantenimiento-preventivo",
    title: "Mantenimiento preventivo: ahorra tiempo y dinero",
    excerpt: "Por qué el mantenimiento regular es la clave para evitar reparaciones costosas.",
    category: "Mantenimiento",
    date: "29 Abril 2025",
    author: "Juan Pérez",
    image: preventiveMaintenanceImg,
    readTime: "4 min",
    content: {
      intro: "El mantenimiento preventivo es una inversión que te ahorra dinero a largo plazo. Descubre por qué es crucial mantener tu hogar en óptimas condiciones.",
      sections: [
        {
          title: "Revisa regularmente tus sistemas",
          content: "Los sistemas de plomería, electricidad y climatización requieren inspecciones periódicas. Detectar problemas temprano puede evitar reparaciones costosas y emergencias incómodas."
        },
        {
          title: "Crea un calendario de mantenimiento",
          content: "Establece un calendario con todas las tareas de mantenimiento: limpieza de canaletas, cambio de filtros, inspección de techos, y más. La consistencia es clave para un hogar bien mantenido."
        },
        {
          title: "No ignores las señales de advertencia",
          content: "Manchas de humedad, ruidos extraños, o cambios en el funcionamiento de equipos son señales que no debes ignorar. Atenderlas a tiempo puede prevenir daños mayores."
        }
      ],
      conclusion: "El mantenimiento preventivo es mucho más económico que las reparaciones de emergencia. En Ofiz, encontrarás profesionales para todas las tareas de mantenimiento de tu hogar."
    }
  },
  {
    id: "profesionales-verificados",
    title: "Profesionales verificados: qué significa y por qué importa",
    excerpt: "Entendé nuestro proceso de verificación y cómo protege a los usuarios de la plataforma.",
    category: "Seguridad",
    date: "26 Abril 2025",
    author: "Equipo Ofiz",
    image: verifiedProfessionalsImg,
    readTime: "5 min",
    content: {
      intro: "En Ofiz, la seguridad y confianza de nuestros usuarios es prioridad. Por eso, todos nuestros profesionales pasan por un riguroso proceso de verificación.",
      sections: [
        {
          title: "Verificación de identidad",
          content: "Cada profesional debe proporcionar documentación oficial que confirme su identidad. Esto garantiza que sabes exactamente con quién estás trabajando."
        },
        {
          title: "Comprobación de credenciales",
          content: "Verificamos que cada profesional tenga las licencias, certificaciones y seguros necesarios para realizar su trabajo. Esto te protege y garantiza que estás trabajando con expertos calificados."
        },
        {
          title: "Revisión de antecedentes",
          content: "Realizamos verificaciones de antecedentes para asegurar que nuestros profesionales cumplan con los estándares de seguridad y confiabilidad que nuestros usuarios esperan."
        },
        {
          title: "Sistema de reseñas y calificaciones",
          content: "Nuestro sistema de reseñas permite que otros usuarios compartan sus experiencias. Esto crea una comunidad transparente donde la calidad del trabajo es reconocida y premiada."
        }
      ],
      conclusion: "La verificación de profesionales no es solo una característica de Ofiz, es un compromiso con tu tranquilidad. Puedes contratar con confianza sabiendo que cada profesional ha sido cuidadosamente evaluado."
    }
  },
  {
    id: "casos-exito-transformaciones",
    title: "Casos de éxito: transformaciones increíbles",
    excerpt: "Historias reales de proyectos exitosos realizados a través de Ofiz.",
    category: "Casos de Éxito",
    date: "23 Abril 2025",
    author: "Equipo Ofiz",
    image: successStoriesImg,
    readTime: "6 min",
    content: {
      intro: "Las mejores historias son las que nuestros usuarios crean con la ayuda de profesionales talentosos. Aquí te compartimos algunas transformaciones increíbles realizadas a través de Ofiz.",
      sections: [
        {
          title: "Renovación completa de cocina en Montevideo",
          content: "María encontró en Ofiz al carpintero y electricista perfectos para renovar su cocina. Lo que comenzó como un espacio anticuado se transformó en una cocina moderna y funcional en solo 3 semanas. El proyecto se completó dentro del presupuesto gracias a la planificación cuidadosa y la experiencia de los profesionales."
        },
        {
          title: "Transformación de jardín en Punta del Este",
          content: "Roberto quería convertir su jardín descuidado en un oasis personal. A través de Ofiz, encontró un jardinero paisajista que no solo cumplió su visión, sino que la superó. El nuevo diseño incluye áreas de descanso, un sistema de riego automatizado y plantas nativas que requieren poco mantenimiento."
        },
        {
          title: "Reparación eléctrica de emergencia",
          content: "Cuando Laura experimentó problemas eléctricos graves, necesitaba ayuda urgente. En menos de 2 horas, un electricista verificado de Ofiz estaba en su casa solucionando el problema. La rapidez y profesionalismo salvaron el día y evitaron daños mayores."
        }
      ],
      conclusion: "Estas son solo algunas de las miles de historias de éxito en Ofiz. Cada proyecto es único, pero todos tienen algo en común: profesionales talentosos conectados con clientes que necesitan sus servicios. ¿Estás listo para crear tu propia historia de éxito?"
    }
  }
];

export const getFeaturedPost = (): BlogPost => {
  return blogPosts[0];
};

export const getAllPosts = (): BlogPost[] => {
  return blogPosts.slice(1);
};

export const getPostById = (id: string): BlogPost | undefined => {
  return blogPosts.find(post => post.id === id);
};
