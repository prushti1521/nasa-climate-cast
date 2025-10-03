import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export interface AnalysisResults {
  probability: number;
  confidenceInterval: [number, number];
  yearsAnalyzed: number;
  percentiles: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  yearlyData: Array<{ year: number; maxTemp: number }>;
}

interface ResultsPanelProps {
  results: AnalysisResults | null;
  onDownloadCSV: () => void;
}

export function ResultsPanel({ results, onDownloadCSV }: ResultsPanelProps) {
  if (!results) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Run an analysis to see results</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Analysis Results</CardTitle>
        <Button variant="outline" size="sm" onClick={onDownloadCSV}>
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Probability */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Probability</h3>
          <p className="text-3xl font-bold text-primary">{results.probability.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">
            95% CI: [{results.confidenceInterval[0].toFixed(1)}%, {results.confidenceInterval[1].toFixed(1)}%]
          </p>
        </div>

        {/* Years Analyzed */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Years Analyzed</h3>
          <p className="text-2xl font-semibold">{results.yearsAnalyzed}</p>
        </div>

        {/* Percentiles */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Temperature Percentiles (°C)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">25th</p>
              <p className="text-lg font-semibold">{results.percentiles.p25.toFixed(1)}°</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">50th</p>
              <p className="text-lg font-semibold">{results.percentiles.p50.toFixed(1)}°</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">75th</p>
              <p className="text-lg font-semibold">{results.percentiles.p75.toFixed(1)}°</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">90th</p>
              <p className="text-lg font-semibold">{results.percentiles.p90.toFixed(1)}°</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
