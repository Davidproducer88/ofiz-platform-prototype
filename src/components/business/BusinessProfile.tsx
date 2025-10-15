import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Phone, Globe, MapPin } from "lucide-react";

interface BusinessProfileProps {
  businessId: string;
  businessProfile: any;
  onUpdate: () => void;
}

export const BusinessProfile = ({ businessId, businessProfile, onUpdate }: BusinessProfileProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: businessProfile?.company_name || '',
    company_type: businessProfile?.company_type || 'other',
    tax_id: businessProfile?.tax_id || '',
    industry: businessProfile?.industry || '',
    website: businessProfile?.website || '',
    company_size: businessProfile?.company_size || 'small',
    billing_address: businessProfile?.billing_address || '',
    billing_email: businessProfile?.billing_email || '',
    billing_phone: businessProfile?.billing_phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (businessProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('business_profiles')
          .update(formData)
          .eq('id', businessId);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('business_profiles')
          .insert({ id: businessId, ...formData });

        if (error) throw error;
      }

      toast({
        title: "Perfil actualizado",
        description: "Tu información empresarial ha sido guardada correctamente",
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error updating business profile:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Información Empresarial
        </CardTitle>
        <CardDescription>
          Gestiona los datos de tu empresa y facturación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Datos de la Empresa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Razón Social *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_type">Tipo de Empresa *</Label>
                <Select
                  value={formData.company_type}
                  onValueChange={(value) => setFormData({ ...formData, company_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware_store">Ferretería</SelectItem>
                    <SelectItem value="construction">Constructora</SelectItem>
                    <SelectItem value="property_management">Administración de Fincas</SelectItem>
                    <SelectItem value="real_estate">Inmobiliaria</SelectItem>
                    <SelectItem value="other">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">RUT/CUIT</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  placeholder="12-34567890-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_size">Tamaño</Label>
                <Select
                  value={formData.company_size}
                  onValueChange={(value) => setFormData({ ...formData, company_size: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeña (1-10 empleados)</SelectItem>
                    <SelectItem value="medium">Mediana (11-50 empleados)</SelectItem>
                    <SelectItem value="large">Grande (50+ empleados)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industria</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Ej: Construcción, Retail"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://tuempresa.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold text-lg">Información de Facturación</h3>
            
            <div className="space-y-2">
              <Label htmlFor="billing_address">Dirección de Facturación</Label>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-2.5" />
                <Textarea
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  placeholder="Calle, número, ciudad, código postal"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing_email">Email de Facturación</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="billing_email"
                    type="email"
                    value={formData.billing_email}
                    onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                    placeholder="facturacion@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_phone">Teléfono de Facturación</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="billing_phone"
                    type="tel"
                    value={formData.billing_phone}
                    onChange={(e) => setFormData({ ...formData, billing_phone: e.target.value })}
                    placeholder="+598 99 123 456"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};