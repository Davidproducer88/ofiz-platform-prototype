import { LucideIcon } from "lucide-react";
import { 
  Zap, 
  Wrench, 
  Paintbrush, 
  Hammer, 
  Sparkles,
  Leaf,
  Car,
  Monitor,
  Home,
  Construction,
  Wind,
  Droplets,
  Shirt,
  Package,
  Scissors,
  Shield,
  Ship,
  Cpu,
  FlaskConical,
  Cog,
  Lightbulb
} from "lucide-react";

export interface ServiceCategory {
  value: string;
  label: string;
  icon: LucideIcon;
  description: string;
  count: string;
  color: string;
  subcategories?: string[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    value: "construction",
    label: "Construcción y Edificación",
    icon: Construction,
    description: "Albañilería, obra, yesería, techado",
    count: "900+ maestros",
    color: "text-orange-500",
    subcategories: [
      "Albañil/Constructor general",
      "Oficial de obra",
      "Hormigonero",
      "Yesero",
      "Techista",
      "Drywaller",
      "Solador",
      "Mosaista",
      "Demoledor"
    ]
  },
  {
    value: "electricity",
    label: "Electricidad",
    icon: Zap,
    description: "Instalaciones, domótica, energía solar",
    count: "850+ maestros",
    color: "text-yellow-500",
    subcategories: [
      "Electricista residencial",
      "Electricista industrial",
      "Técnico en domótica",
      "Instalador de alarmas",
      "Instalador de paneles solares",
      "Electricista automotor"
    ]
  },
  {
    value: "plumbing",
    label: "Plomería y Gasfitería", 
    icon: Droplets,
    description: "Sanitaria, gas, agua caliente, riego",
    count: "720+ maestros",
    color: "text-blue-500",
    subcategories: [
      "Plomero/Gasista matriculado",
      "Instalador de agua caliente",
      "Técnico en calefones",
      "Instalador de bombas",
      "Desatascador",
      "Instalador de riego"
    ]
  },
  {
    value: "hvac",
    label: "Climatización",
    icon: Wind,
    description: "Aire acondicionado, calefacción, ventilación",
    count: "480+ maestros",
    color: "text-cyan-500",
    subcategories: [
      "Técnico en aire acondicionado",
      "Instalador de calefacción",
      "Técnico en estufas y calderas",
      "Instalador de ventilación",
      "Técnico en refrigeración"
    ]
  },
  {
    value: "carpentry",
    label: "Carpintería y Muebles",
    icon: Hammer,
    description: "Madera, muebles a medida, restauración",
    count: "650+ maestros", 
    color: "text-amber-500",
    subcategories: [
      "Carpintero de obra",
      "Ebanista",
      "Restaurador de muebles",
      "Fabricante de muebles a medida",
      "Constructor de escaleras",
      "Instalador de aberturas"
    ]
  },
  {
    value: "metalwork",
    label: "Herrería y Metales",
    icon: Wrench,
    description: "Cerrajería, rejas, aluminio y vidrio",
    count: "420+ maestros",
    color: "text-slate-500",
    subcategories: [
      "Herrero artístico",
      "Cerrajero",
      "Carpintero metálico",
      "Fabricante de muebles de hierro",
      "Instalador de cortinas metálicas",
      "Técnico en aluminio y vidrio"
    ]
  },
  {
    value: "automotive",
    label: "Mecánica Automotor",
    icon: Car,
    description: "Autos, motos, electricidad, chapa y pintura",
    count: "580+ maestros",
    color: "text-red-500",
    subcategories: [
      "Mecánico general",
      "Mecánico diesel",
      "Electricista automotor",
      "Chapista",
      "Pintor de automóviles",
      "Mecánico de motos"
    ]
  },
  {
    value: "industrial",
    label: "Mecánica Industrial",
    icon: Cog,
    description: "Maquinaria agrícola, compresores, mantenimiento",
    count: "320+ maestros",
    color: "text-gray-500",
    subcategories: [
      "Mecánico industrial",
      "Técnico en maquinaria agrícola",
      "Mantenedor industrial",
      "Técnico en compresores",
      "Mecánico de herramientas eléctricas"
    ]
  },
  {
    value: "appliances",
    label: "Electrodomésticos",
    icon: Monitor,
    description: "Línea blanca, heladeras, lavarropas",
    count: "450+ maestros",
    color: "text-indigo-500",
    subcategories: [
      "Técnico en heladeras",
      "Reparador de lavarropas",
      "Técnico en lavavajillas",
      "Reparador de secarropas",
      "Técnico en cocinas y hornos",
      "Reparador de microondas"
    ]
  },
  {
    value: "computer",
    label: "Electrónica e Informática",
    icon: Cpu,
    description: "Computadoras, celulares, audio/video",
    count: "380+ maestros",
    color: "text-purple-500",
    subcategories: [
      "Técnico en computadoras",
      "Reparador de celulares",
      "Técnico en televisores",
      "Instalador de audio/video",
      "Técnico en consolas"
    ]
  },
  {
    value: "textiles",
    label: "Textiles y Confección",
    icon: Shirt,
    description: "Sastrería, tapicería, cortinas, calzado",
    count: "290+ maestros",
    color: "text-pink-500",
    subcategories: [
      "Sastre/Modista",
      "Costurera",
      "Tapicero",
      "Cortinero",
      "Reparador de calzado",
      "Talabartero"
    ]
  },
  {
    value: "gardening",
    label: "Jardinería y Paisajismo",
    icon: Leaf,
    description: "Espacios verdes, podación, diseño, piscinas",
    count: "520+ maestros",
    color: "text-emerald-500",
    subcategories: [
      "Jardinero",
      "Paisajista",
      "Podador de árboles",
      "Diseñador de jardines",
      "Mantenedor de piscinas",
      "Instalador de riego automático"
    ]
  },
  {
    value: "glass",
    label: "Vidriería y Cristalería",
    icon: Home,
    description: "Vidrios, espejos, mamparas, vitral",
    count: "240+ maestros",
    color: "text-sky-500",
    subcategories: [
      "Vidriero residencial",
      "Vidriero automotor",
      "Instalador de vidrios templados",
      "Espejista",
      "Vitralista",
      "Instalador de mamparas"
    ]
  },
  {
    value: "moving",
    label: "Mudanzas y Montaje",
    icon: Package,
    description: "Mudanzas, armado de muebles, instalaciones",
    count: "350+ maestros",
    color: "text-orange-400",
    subcategories: [
      "Mudancero",
      "Montador de muebles",
      "Instalador de cortinas",
      "Colocador de cuadros",
      "Montador de iluminación",
      "Instalador de estanterías"
    ]
  },
  {
    value: "painting",
    label: "Pintura y Acabados",
    icon: Paintbrush,
    description: "Interiores, exteriores, empapelado, texturas",
    count: "680+ maestros",
    color: "text-violet-500",
    subcategories: [
      "Pintor interior/exterior",
      "Empapelador",
      "Estucador",
      "Aplicador de texturas",
      "Lustrador de pisos",
      "Restaurador de fachadas"
    ]
  },
  {
    value: "crafts",
    label: "Artesanías",
    icon: Scissors,
    description: "Cerámica, joyería, restauración, serigrafía",
    count: "180+ maestros",
    color: "text-rose-500",
    subcategories: [
      "Ceramista",
      "Alfarero",
      "Joyero/Platero",
      "Restaurador de obras",
      "Serigrafista",
      "Encuadernador"
    ]
  },
  {
    value: "cleaning",
    label: "Limpieza y Mantenimiento",
    icon: Sparkles,
    description: "Residencial, comercial, industrial, plagas",
    count: "620+ maestros",
    color: "text-green-500",
    subcategories: [
      "Limpiador residencial",
      "Limpiador de oficinas",
      "Limpiador de vidrios en altura",
      "Limpiador de alfombras",
      "Fumigador/Control de plagas",
      "Limpiador de piscinas"
    ]
  },
  {
    value: "security",
    label: "Seguridad y Accesibilidad",
    icon: Shield,
    description: "Cerrajería, alarmas, rejas, accesibilidad",
    count: "310+ maestros",
    color: "text-yellow-600",
    subcategories: [
      "Cerrajero residencial",
      "Instalador de cerraduras de seguridad",
      "Montador de puertas blindadas",
      "Instalador de rejas",
      "Técnico en sistemas de acceso",
      "Instalador de rampas"
    ]
  },
  {
    value: "renewable",
    label: "Energías Alternativas",
    icon: Lightbulb,
    description: "Paneles solares, eólica, sustentable",
    count: "220+ maestros",
    color: "text-lime-500",
    subcategories: [
      "Instalador de paneles solares",
      "Técnico en energía eólica",
      "Instalador de sistemas sustentables",
      "Técnico en geotermia",
      "Especialista en eficiencia energética"
    ]
  },
  {
    value: "marine",
    label: "Oficios Marítimos",
    icon: Ship,
    description: "Embarcaciones, mecánica naval, velero",
    count: "85+ maestros",
    color: "text-teal-500",
    subcategories: [
      "Carpintero de ribera",
      "Reparador de embarcaciones",
      "Mecánico naval",
      "Electricista naval",
      "Velero"
    ]
  },
  {
    value: "emerging",
    label: "Oficios Emergentes",
    icon: FlaskConical,
    description: "Impresión 3D, drones, automatización, vehículos eléctricos",
    count: "150+ maestros",
    color: "text-fuchsia-500",
    subcategories: [
      "Impresor 3D",
      "Técnico en drones",
      "Instalador de cargadores eléctricos",
      "Técnico en automatización residencial",
      "Especialista en IoT"
    ]
  }
];

// Helper function to get category by value
export const getCategoryByValue = (value: string): ServiceCategory | undefined => {
  return SERVICE_CATEGORIES.find(cat => cat.value === value);
};

// Helper function to get all category values
export const getCategoryValues = (): string[] => {
  return SERVICE_CATEGORIES.map(cat => cat.value);
};

// Helper function to get category label
export const getCategoryLabel = (value: string): string => {
  const category = getCategoryByValue(value);
  return category ? category.label : value;
};
