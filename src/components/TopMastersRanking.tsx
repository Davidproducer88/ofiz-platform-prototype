import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, Award, DollarSign, AlertCircle, ExternalLink } from 'lucide-react';
import { useMasterRankings } from '@/hooks/useMasterRankings';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
export function TopMastersRanking() {
  const {
    rankings,
    loading,
    refetch
  } = useMasterRankings(10);
  const navigate = useNavigate();
  const handleViewProfile = (masterId: string) => {
    navigate(`/search-masters?master=${masterId}`);
  };
  if (loading) {
    return <Card>
        <CardHeader>
          <CardTitle>Top Profesionales</CardTitle>
          <CardDescription>Ranking actualizado en tiempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        </CardContent>
      </Card>;
  }
  if (!rankings || rankings.length === 0) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Profesionales
          </CardTitle>
          <CardDescription>Ranking actualizado en tiempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">El ranking se actualizará cuando los profesionales completen trabajos y reciban reseñas</p>
          </div>
        </CardContent>
      </Card>;
  }
  const getMedalColor = (position: number) => {
    if (position === 1) return 'text-yellow-500';
    if (position === 2) return 'text-gray-400';
    if (position === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  };
  return <Card className="shadow-elegant border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            🏆 Top 10 Profesionales Destacados
          </CardTitle>
          <Badge className="bg-gradient-hero text-white border-0 shadow-soft">
            Actualizado en vivo
          </Badge>
        </div>
        <CardDescription className="text-base">
          Los profesionales mejor valorados por la comunidad Ofiz • Ranking basado en calidad, puntualidad y satisfacción del cliente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rankings.map((ranking, index) => <div key={ranking.id} className="flex items-center justify-between p-5 rounded-xl border-2 border-border/50 bg-gradient-to-br from-card to-card/30 hover:border-primary/30 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer group animate-fade-in" onClick={() => handleViewProfile(ranking.master_id)} style={{
          animationDelay: `${index * 50}ms`
        }}>
              <div className="flex items-center gap-4 flex-1">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-background to-muted shadow-soft ${getMedalColor(ranking.rank_position || 0)}`}>
                  <span className="text-xl font-bold">#{ranking.rank_position}</span>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold">{ranking.masters?.business_name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span>{ranking.average_rating.toFixed(1)}</span>
                      <span>({ranking.masters?.total_reviews || 0})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{ranking.total_completed_jobs} trabajos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${ranking.total_earnings.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary">
                  Score: {ranking.ranking_score.toFixed(1)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {ranking.completion_rate.toFixed(0)}% completado
                </span>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity mt-2" onClick={e => {
              e.stopPropagation();
              handleViewProfile(ranking.master_id);
            }}>
                  Ver Perfil
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>)}

          {rankings.length === 0 && !loading && <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aún no hay profesionales con rankings. Los rankings se generan automáticamente basados en calificaciones, trabajos completados y desempeño.
              </AlertDescription>
            </Alert>}
        </div>
      </CardContent>
    </Card>;
}