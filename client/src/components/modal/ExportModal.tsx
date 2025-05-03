import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { FileImage, Video } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  exportType: 'gif' | 'video';
}

export interface ExportOptions {
  filename: string;
  type: 'gif' | 'video';
  quality: 'low' | 'medium' | 'high';
  speed: number;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  exportType
}) => {
  const [filename, setFilename] = useState('my-animation');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [speed, setSpeed] = useState(3);
  
  const handleExport = () => {
    onExport({
      filename,
      type: exportType,
      quality,
      speed
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Animation</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="filename">File Name</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter file name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Format</Label>
            <div className="flex space-x-2">
              <Button
                variant={exportType === 'gif' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => {}}
                disabled={true}
              >
                <FileImage className="h-4 w-4 mr-2" /> GIF
              </Button>
              <Button
                variant={exportType === 'video' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => {}}
                disabled={true}
              >
                <Video className="h-4 w-4 mr-2" /> Video
              </Button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="quality">Quality</Label>
            <Select value={quality} onValueChange={(value: any) => setQuality(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (larger file)</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low (smaller file)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Animation Speed</Label>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Slow</span>
              <Slider
                value={[speed]}
                min={1}
                max={5}
                step={1}
                onValueChange={(values) => setSpeed(values[0])}
                className="flex-1 mx-2"
              />
              <span className="text-xs text-gray-500">Fast</span>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
