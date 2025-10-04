import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalysisFormProps {
  latitude: number;
  longitude: number;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  onAnalyze: (params: AnalysisParams) => void;
  isLoading: boolean;
}

export interface AnalysisParams {
  latitude: number;
  longitude: number;
  month: number;
  day: number;
  window: number;
  threshold: number;
}

export function AnalysisForm({ 
  latitude, 
  longitude, 
  onLatitudeChange, 
  onLongitudeChange, 
  onAnalyze,
  isLoading 
}: AnalysisFormProps) {
  const [month, setMonth] = useState(7);
  const [day, setDay] = useState(15);
  const [window, setWindow] = useState(3);
  const [threshold, setThreshold] = useState(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({ latitude, longitude, month, day, window, threshold });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) onLatitudeChange(value);
                }}
                required
                min={-90}
                max={90}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) onLongitudeChange(value);
                }}
                required
                min={-180}
                max={180}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="number"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                required
                min={1}
                max={12}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day">Day</Label>
              <Input
                id="day"
                type="number"
                value={day}
                onChange={(e) => setDay(parseInt(e.target.value))}
                required
                min={1}
                max={31}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="window">Window (days before/after)</Label>
            <Input
              id="window"
              type="number"
              value={window}
              onChange={(e) => setWindow(parseInt(e.target.value))}
              required
              min={0}
              max={30}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Temperature Threshold (°C)</Label>
            <Input
              id="threshold"
              type="number"
              step="0.1"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
