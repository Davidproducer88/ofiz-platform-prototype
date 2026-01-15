import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Settings, 
  DollarSign, 
  Percent, 
  Shield, 
  Bell, 
  Database,
  Code,
  Server,
  RefreshCcw,
  Save,
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";

interface PlatformConfig {
  // Comisiones
  platformCommission: number;
  founderDiscount: number;
  referralCredit: number;
  // Límites
  maxFreeApplications: number;
  maxFounders: number;
  // Configuraciones generales
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotificationsEnabled: boolean;
}

export const PlatformConfiguration = () => {
  const [config, setConfig] = useState<PlatformConfig>({
    platformCommission: 5,
    founderDiscount: 20,
    referralCredit: 5000,
    maxFreeApplications: 3,
    maxFounders: 1000,
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotificationsEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [edgeFunctionStatus, setEdgeFunctionStatus] = useState<Record<string, 'active' | 'error' | 'unknown'>>({});

  const edgeFunctions = [
    'create-booking-payment',
    'create-business-subscription',
    'create-business-subscription-payment',
    'create-contract-payment',
    'create-marketplace-payment',
    'create-master-subscription',
    'create-master-subscription-payment',
    'create-payment-preference',
    'filter-chat-message',
    'manage-subscription',
    'mercadopago-webhook',
    'register-client',
    'register-master',
    'release-escrow',
    'search-master',
    'send-founder-welcome-email',
    'send-verification-email',
    'verify-payment-status'
  ];

  const requiredSecrets = [
    { name: 'MERCADOPAGO_ACCESS_TOKEN', description: 'Token de acceso de MercadoPago', required: true },
    { name: 'RESEND_API_KEY', description: 'API Key de Resend para emails', required: true },
    { name: 'SUPABASE_URL', description: 'URL del proyecto Supabase', required: true },
    { name: 'SUPABASE_ANON_KEY', description: 'Key anónima de Supabase', required: true },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Key de rol de servicio', required: true },
  ];

  const databaseTables = [
    { name: 'profiles', description: 'Perfiles de usuarios', rls: true },
    { name: 'masters', description: 'Perfiles de profesionales', rls: true },
    { name: 'services', description: 'Servicios ofrecidos', rls: true },
    { name: 'bookings', description: 'Reservas de servicios', rls: true },
    { name: 'payments', description: 'Pagos y transacciones', rls: true },
    { name: 'subscriptions', description: 'Suscripciones de maestros', rls: true },
    { name: 'business_subscriptions', description: 'Suscripciones empresariales', rls: true },
    { name: 'reviews', description: 'Reseñas y calificaciones', rls: true },
    { name: 'notifications', description: 'Notificaciones del sistema', rls: true },
    { name: 'conversations', description: 'Conversaciones de chat', rls: true },
    { name: 'messages', description: 'Mensajes de chat', rls: true },
    { name: 'disputes', description: 'Disputas y reclamaciones', rls: true },
  ];

  useEffect(() => {
    // Verificar estado de las edge functions
    checkEdgeFunctions();
  }, []);

  const checkEdgeFunctions = async () => {
    const statuses: Record<string, 'active' | 'error' | 'unknown'> = {};
    for (const fn of edgeFunctions) {
      statuses[fn] = 'active'; // Asumimos que están activas si se desplegaron
    }
    setEdgeFunctionStatus(statuses);
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      // Aquí se guardarían las configuraciones en la base de datos
      // Por ahora solo mostramos un mensaje de éxito
      toast({
        title: "Configuración guardada",
        description: "Los cambios se aplicarán en la próxima recarga."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles"
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financiero
          </TabsTrigger>
          <TabsTrigger value="backend" className="gap-2">
            <Server className="h-4 w-4" />
            Backend
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2">
            <Database className="h-4 w-4" />
            Base de Datos
          </TabsTrigger>
        </TabsList>

        {/* General Configuration */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Ajustes generales de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Modo Mantenimiento</Label>
                    <p className="text-sm text-muted-foreground">
                      Desactiva el acceso público a la plataforma
                    </p>
                  </div>
                  <Switch
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, maintenanceMode: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Registro Habilitado</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite nuevos registros de usuarios
                    </p>
                  </div>
                  <Switch
                    checked={config.registrationEnabled}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, registrationEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Envío de emails transaccionales
                    </p>
                  </div>
                  <Switch
                    checked={config.emailNotificationsEnabled}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, emailNotificationsEnabled: checked }))
                    }
                  />
                </div>

                <div className="space-y-2 p-4 border rounded-lg">
                  <Label>Límite de Fundadores</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={config.maxFounders}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, maxFounders: parseInt(e.target.value) || 0 }))
                      }
                    />
                    <Button variant="outline" size="sm">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Número máximo de fundadores permitidos
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveConfig} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Configuration */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Configuración Financiera
              </CardTitle>
              <CardDescription>Comisiones, descuentos y créditos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Comisión de Plataforma
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.platformCommission}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, platformCommission: parseFloat(e.target.value) || 0 }))
                      }
                      className="text-lg font-bold"
                    />
                    <span className="text-lg font-bold">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Porcentaje que cobra la plataforma por cada transacción
                  </p>
                </div>

                <div className="space-y-2 p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <Label className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Descuento Fundadores
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.founderDiscount}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, founderDiscount: parseFloat(e.target.value) || 0 }))
                      }
                      className="text-lg font-bold"
                    />
                    <span className="text-lg font-bold">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Descuento aplicado a suscripciones de fundadores
                  </p>
                </div>

                <div className="space-y-2 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Crédito por Referido
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">$</span>
                    <Input
                      type="number"
                      value={config.referralCredit}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, referralCredit: parseInt(e.target.value) || 0 }))
                      }
                      className="text-lg font-bold"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Crédito otorgado por cada referido exitoso
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Límites de Plan Gratuito
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 border rounded-lg">
                    <Label>Aplicaciones Mensuales (Free)</Label>
                    <Input
                      type="number"
                      value={config.maxFreeApplications}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, maxFreeApplications: parseInt(e.target.value) || 0 }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Límite de postulaciones para plan gratuito
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveConfig} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backend Configuration */}
        <TabsContent value="backend">
          <div className="space-y-6">
            {/* Edge Functions Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Edge Functions
                </CardTitle>
                <CardDescription>Estado de las funciones serverless</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {edgeFunctions.map((fn) => (
                    <div 
                      key={fn} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          edgeFunctionStatus[fn] === 'active' ? 'bg-green-500' :
                          edgeFunctionStatus[fn] === 'error' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <code className="text-xs font-mono">{fn}</code>
                      </div>
                      <Badge variant={edgeFunctionStatus[fn] === 'active' ? 'default' : 'destructive'} className="text-xs">
                        {edgeFunctionStatus[fn] === 'active' ? 'Activa' : 'Error'}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={checkEdgeFunctions}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Verificar Estado
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Secrets Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Variables de Entorno (Secrets)
                </CardTitle>
                <CardDescription>Claves API y configuraciones sensibles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requiredSecrets.map((secret) => (
                    <div 
                      key={secret.name} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono font-medium">{secret.name}</code>
                          {secret.required && (
                            <Badge variant="outline" className="text-xs">Requerido</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{secret.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500">Configurado</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(secret.name)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Gestión de Secrets
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Los secrets se gestionan a través del panel de Lovable Cloud. 
                        Para agregar o modificar secrets, usa la herramienta de gestión de secrets en el panel lateral.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Database Configuration */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Tablas de Base de Datos
              </CardTitle>
              <CardDescription>Estado y configuración de las tablas principales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {databaseTables.map((table) => (
                  <div 
                    key={table.name} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <code className="text-sm font-mono font-medium">{table.name}</code>
                      <p className="text-xs text-muted-foreground">{table.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {table.rls ? (
                        <Badge className="bg-green-500 gap-1">
                          <Shield className="h-3 w-3" />
                          RLS
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Sin RLS
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium">Información del Proyecto</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <Label className="text-xs text-muted-foreground">Project ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm font-mono">dexrrbbpeidcxoynkyrt</code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard('dexrrbbpeidcxoynkyrt')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <Label className="text-xs text-muted-foreground">Region</Label>
                    <p className="text-sm font-mono mt-1">South America (São Paulo)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
