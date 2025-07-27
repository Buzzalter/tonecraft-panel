import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Mic, Speaker } from 'lucide-react';

interface DeviceSelectorProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  type: 'input' | 'output';
  devices: { id: string; name: string }[];
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  label,
  value,
  onValueChange,
  type,
  devices
}) => {
  const Icon = type === 'input' ? Mic : Speaker;

  return (
    <div className="space-y-2">
      <Label className="flex items-center space-x-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" />
        <span>{label}</span>
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="bg-card border-border hover:border-primary/50 transition-colors">
          <SelectValue placeholder={`Select ${type} device`} />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border shadow-lg">
          {devices.map((device) => (
            <SelectItem 
              key={device.id} 
              value={device.id}
              className="hover:bg-accent focus:bg-accent"
            >
              {device.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};