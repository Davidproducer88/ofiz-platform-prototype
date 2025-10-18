import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Award, DollarSign } from 'lucide-react';
import { useMasterRankings } from '@/hooks/useMasterRankings';
import { Skeleton } from '@/components/ui/skeleton';

export function TopMastersRanking() {
  const { rankings, loading } = useMasterRankings(10);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Profesionales</CardTitle>
          <CardDescription>Ranking actualizado en tiempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMedalColor = (position: number) => {
    if (position === 1) return 'text-yellow-500';
    if (position === 2) return 'text-gray-400';
    if (position === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Top Profesionales
        </CardTitle>
        <CardDescription>Ranking actualizado en tiempo real basado en calificaciones y desempeño</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rankings.map((ranking) => (
            <div
              key={ranking.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`text-2xl font-bold ${getMedalColor(ranking.rank_position || 0)}`}>
                  #{ranking.rank_position}
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
              </div>
            </div>
          ))}

          {rankings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay profesionales rankeados aún
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
