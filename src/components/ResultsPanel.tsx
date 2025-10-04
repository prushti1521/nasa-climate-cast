import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileText } from 'lucide-react';
import { getVariableById } from '@/lib/weatherVariables';

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
  yearlyData: Array<{
    year: number;
    maxValue: number;
  }>;
  metadata?: {
    location: { latitude: number; longitude: number };
    dateWindow: { month: number; day: number; windowDays: number };
    threshold: number;
    variable: string;
    dataSource: string;
    apiUrl: string;
    dateRange: { startYear: number; endYear: number };
  };
}

interface ResultsPanelProps {
  results: AnalysisResults | null;
  onDownloadCSV: () => void;
  onDownloadJSON: () => void;
}

export function ResultsPanel({ results, onDownloadCSV, onDownloadJSON }: ResultsPanelProps) {
  const variable = results?.metadata?.variable 
    ? getVariableById(results.metadata.variable)
    : null;
  
  const getInterpretation = () => {
    if (!results) return '';
    
    const prob = results.probability;
    if (prob >= 75) return 'Very likely - This condition occurs frequently at this time';
    if (prob >= 50) return 'Likely - This condition occurs more often than not';
    if (prob >= 25) return 'Possible - This condition occurs occasionally';
    return 'Unlikely - This condition rarely occurs at this time';
  };

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
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Analysis Results</CardTitle>
            {results.metadata && variable && (
              <p className="text-sm text-muted-foreground mt-1">
                {variable.name} Analysis
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={onDownloadCSV} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button onClick={onDownloadJSON} variant="outline" size="sm">
              <FileJson className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Interpretation
          </p>
          <p className="text-sm">{getInterpretation()}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Probability</h3>
          <p className="text-3xl font-bold text-primary">{results.probability.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">
            95% CI: [{results.confidenceInterval[0].toFixed(1)}%, {results.confidenceInterval[1].toFixed(1)}%]
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Years Analyzed</h3>
          <p className="text-2xl font-semibold">{results.yearsAnalyzed}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Percentiles ({variable?.unit || '°C'})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">25th</p>
              <p className="text-lg font-semibold">{results.percentiles.p25.toFixed(1)}</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">50th</p>
              <p className="text-lg font-semibold">{results.percentiles.p50.toFixed(1)}</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">75th</p>
              <p className="text-lg font-semibold">{results.percentiles.p75.toFixed(1)}</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">90th</p>
              <p className="text-lg font-semibold">{results.percentiles.p90.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {results.metadata && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground space-y-1">
              <strong>Data Source:</strong> {results.metadata.dataSource}<br />
              <strong>Period:</strong> {results.metadata.dateRange.startYear}-{results.metadata.dateRange.endYear}<br />
              <strong>Location:</strong> {results.metadata.location.latitude.toFixed(4)}°, {results.metadata.location.longitude.toFixed(4)}°<br />
              <strong>API:</strong>{' '}
              <a 
                href={results.metadata.apiUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {results.metadata.apiUrl}
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
