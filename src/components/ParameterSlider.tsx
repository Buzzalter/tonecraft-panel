import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ParameterSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  description?: string;
}

export const ParameterSlider: React.FC<ParameterSliderProps> = ({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  unit = '',
  description
}) => {
  const handleValueChange = (newValue: number[]) => {
    onValueChange(newValue[0]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-card-foreground">
          {label}
        </Label>
        <span className="text-sm font-mono bg-primary/10 px-2 py-1 rounded text-primary">
          {value}{unit}
        </span>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
};