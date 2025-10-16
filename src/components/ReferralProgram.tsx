import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Copy, Gift, Users, DollarSign, Share2 } from 'lucide-react';

interface ReferralStats {
  code: string;
  totalReferrals: number;
  pendingReferrals: number;
  totalCredits: number;
  availableCredits: number;
}

export const ReferralProgram = ({ userId }: { userId: string }) => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralStats();
  }, [userId]);

  const fetchReferralStats = async () => {
    try {
      // Obtener código de referido
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (codeError) throw codeError;

      // Obtener estadísticas de referidos
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('status')
        .eq('referrer_id', userId);

      if (refError) throw refError;

      // Obtener créditos
      const { data: credits, error: creditsError } = await supabase
        .from('referral_credits')
        .select('amount, used')
        .eq('user_id', userId);

      if (creditsError) throw creditsError;

      const totalReferrals = referrals?.length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
      const totalCredits = credits?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
      const availableCredits = credits?.filter(c => !c.used).reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      setStats({
        code: codeData.code,
        totalReferrals,
        pendingReferrals,
        totalCredits,
        availableCredits,
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas de referidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (stats?.code) {
      navigator.clipboard.writeText(stats.code);
      toast({
        title: "¡Código copiado!",
        description: "Comparte tu código con tus amigos",
      });
    }
  };

  const shareReferralLink = async () => {
    const url = `${window.location.origin}/auth?ref=${stats?.code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '¡Gana $U 500 de descuento!',
          text: `Únete a nuestra plataforma con mi código ${stats?.code} y ambos recibiremos descuentos`,
          url,
        });
      } catch (error) {
        // Usuario canceló o error al compartir
        copyReferralLink(url);
      }
    } else {
      copyReferralLink(url);
    }
  };

  const copyReferralLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "¡Link copiado!",
      description: "Comparte este link con tus amigos",
    });
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-card bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            <CardTitle>Programa "Amigos que Comparten"</CardTitle>
          </div>
          <CardDescription>
            Refiere amigos y ambos ganan descuentos. ¡Es muy simple!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Tu código de referido:</p>
            <div className="flex gap-2">
              <Input
                value={stats?.code || ''}
                readOnly
                className="font-mono text-lg font-bold text-center"
              />
              <Button onClick={copyReferralCode} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={shareReferralLink} variant="default" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-background/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">¿Cómo funciona?</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Comparte tu código con amigos</li>
              <li>Tu amigo se registra usando tu código</li>
              <li>Ambos reciben descuentos automáticamente:
                <ul className="ml-6 mt-1 list-disc list-inside">
                  <li>Tú recibes <strong className="text-primary">$U 500</strong> de descuento</li>
                  <li>Tu amigo recibe <strong className="text-secondary">$U 500</strong> de bienvenida</li>
                </ul>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referidos</p>
                <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
                {stats?.pendingReferrals ? (
                  <Badge variant="secondary" className="mt-1">
                    {stats.pendingReferrals} pendientes
                  </Badge>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Créditos Disponibles</p>
                <p className="text-2xl font-bold text-secondary">
                  $U {stats?.availableCredits.toLocaleString() || 0}
                </p>
                {stats?.totalCredits ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Total ganado: $U {stats.totalCredits.toLocaleString()}
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="shadow-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">Usa tus créditos</p>
              <p className="text-sm text-muted-foreground">
                Tus créditos se aplicarán automáticamente en tu próximo encargo. 
                Los descuentos no tienen fecha de expiración.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
