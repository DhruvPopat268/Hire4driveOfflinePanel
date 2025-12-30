import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface WeeklyFormProps {
  selectedUsage: string;
  durationType?: string;
  durationValue?: string;
  durationOptions?: Array<{value: string; hours: string; km: string}> | string[];
  durationError?: string;
  onUsageChange: (value: string) => void;
  onDurationTypeChange?: (value: string) => void;
  onDurationValueChange?: (value: string) => void;
}

export const WeeklyForm: React.FC<WeeklyFormProps> = ({
  selectedUsage,
  durationType = 'Day',
  durationValue = '3',
  durationOptions = [],
  durationError = '',
  onUsageChange,
  onDurationTypeChange,
  onDurationValueChange,
}) => {
  // Handle both new object format and legacy string array
  const usageOptions = Array.isArray(durationOptions) && durationOptions.length > 0 && typeof durationOptions[0] === 'object'
    ? durationOptions as Array<{value: string; hours: string; km: string}>
    : durationOptions.length > 0 
      ? (durationOptions as string[]).map(opt => ({ value: opt, hours: opt, km: '0' }))
      : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(opt => ({ value: opt, hours: opt, km: '0' }));

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Estimated Duration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="usage-select">Duration Options</Label>
            <Select value={selectedUsage} onValueChange={onUsageChange}>
              <SelectTrigger id="usage-select">
                <SelectValue placeholder="Select hours" />
              </SelectTrigger>
              <SelectContent>
                {usageOptions.map((option) => (
                  <SelectItem key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
                    {typeof option === 'string' ? `${option} Hr` : option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="duration-input">No Of Days</Label>
            <Input
              id="duration-input"
              type="number"
              min="3"
              placeholder="Enter days (min 3)"
              value={durationValue}
              onChange={(e) => {
                const newValue = e.target.value;
                if (onDurationValueChange) {
                  onDurationValueChange(newValue);
                }
              }}
              className={durationError ? 'border-red-500' : ''}
            />
            {durationError && (
              <p className="text-red-500 text-sm mt-1">{durationError}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};