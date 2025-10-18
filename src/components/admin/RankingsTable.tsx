import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, TrendingUp, Award, DollarSign, Users } from 'lucide-react';
import { useMasterRankings } from '@/hooks/useMasterRankings';
import { Skeleton } from '@/components/ui/skeleton';

export function RankingsTable() {
  const { rankings, loading } = useMasterRankings();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rankings de Profesionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Rankings de Profesionales
        </CardTitle>
        <CardDescription>
          Sistema de ranking actualizado en tiempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Pos.</TableHead>
              <TableHead>Profesional</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Trabajos</TableHead>
              <TableHead>% Completitud</TableHead>
              <TableHead>Ingresos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((ranking) => (
              <TableRow key={ranking.id}>
                <TableCell>
                  <div className="flex items-center justify-center">
                    {ranking.rank_position && ranking.rank_position <= 3 ? (
                      <Award className={`h-5 w-5 ${
                        ranking.rank_position === 1 ? 'text-accent' :
                        ranking.rank_position === 2 ? 'text-muted-foreground' :
                        'text-accent/70'
                      }`} />
                    ) : (
                      <span className="font-semibold">#{ranking.rank_position}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{ranking.masters?.business_name}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {ranking.ranking_score.toFixed(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium">{ranking.average_rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({ranking.masters?.total_reviews || 0})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{ranking.total_completed_jobs}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={ranking.completion_rate >= 80 ? "default" : "secondary"}
                  >
                    {ranking.completion_rate.toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-primary font-medium">
                    <DollarSign className="h-4 w-4" />
                    <span>${ranking.total_earnings.toFixed(0)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {rankings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay rankings disponibles todavía</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
