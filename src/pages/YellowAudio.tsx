import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioUpload } from '@/components/AudioUpload';
import { AudioPreview } from '@/components/AudioPreview';
import { DeviceSelector } from '@/components/DeviceSelector';
import { ParameterSlider } from '@/components/ParameterSlider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Play, Square, Headphones } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { audioAPI } from '@/lib/api';

interface AudioDevice {
  id: string;
  name: string;
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
];

export default function YellowAudio() {
  const { toast } = useToast();
  
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState('');
  const [sampleDuration, setSampleDuration] = useState(2.75);
  const [chunkSize, setChunkSize] = useState(0.5);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  // Processing states
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showWarmupDialog, setShowWarmupDialog] = useState(false);

  // Load devices on component mount
  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const { inputDevices: apiInputDevices, outputDevices: apiOutputDevices } = await audioAPI.detectDevices();
      
      setInputDevices(apiInputDevices);
      setOutputDevices(apiOutputDevices);
      
      if (apiInputDevices.length > 0) setSelectedInputDevice(apiInputDevices[0].id);
      if (apiOutputDevices.length > 0) setSelectedOutputDevice(apiOutputDevices[0].id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audio devices",
        variant: "destructive",
      });
    }
  };

  const handleStartStop = async () => {
    if (isRunning) {
      // Stop processing
      try {
        await audioAPI.stop();
        setIsRunning(false);
        toast({
          title: "Processing Stopped",
          description: "Audio processing has been stopped",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to stop audio processing",
          variant: "destructive",
        });
      }
    } else {
      // Start processing
      setShowWarmupDialog(true);
      setIsWarmingUp(true);
      
      try {
        const config = {
          sampleDuration,
          chunkSize,
          inputDevice: selectedInputDevice,
          outputDevice: selectedOutputDevice,
          language: selectedLanguage,
          referenceAudio: selectedFile || undefined,
        };
        
        await audioAPI.start(config);
        setIsWarmingUp(false);
        setIsRunning(true);
        setShowWarmupDialog(false);
        toast({
          title: "Processing Started",
          description: "Audio processing is now active",
        });
      } catch (error) {
        setIsWarmingUp(false);
        setShowWarmupDialog(false);
        toast({
          title: "Error",
          description: "Failed to start audio processing",
          variant: "destructive",
        });
      }
    }
  };

  const isConfigDisabled = isWarmingUp || isRunning;

  return (
    <div className="bg-gradient-soft p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Audio Processing Studio
          </h1>
          <p className="text-muted-foreground">
            Configure your audio processing parameters and start real-time processing
          </p>
        </div>

        {/* Reference Audio Upload */}
        <Card className={`shadow-soft border-border/50 transition-all duration-500 ${
          isConfigDisabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Headphones className="h-5 w-5 text-primary" />
              <span>Reference Audio</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AudioUpload 
              onFileSelect={setSelectedFile} 
              selectedFile={selectedFile}
              disabled={isConfigDisabled}
            />
            {selectedFile && (
              <AudioPreview 
                file={selectedFile} 
                onRemove={() => setSelectedFile(null)} 
              />
            )}
          </CardContent>
        </Card>

        {/* Configuration Panel */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Audio Devices */}
          <Card className={`shadow-soft border-border/50 transition-all duration-500 ${
            isConfigDisabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
          }`}>
            <CardHeader>
              <CardTitle>Audio Devices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DeviceSelector
                label="Input Device"
                value={selectedInputDevice}
                onValueChange={setSelectedInputDevice}
                type="input"
                devices={inputDevices}
                disabled={isConfigDisabled}
              />
              <DeviceSelector
                label="Output Device"
                value={selectedOutputDevice}
                onValueChange={setSelectedOutputDevice}
                type="output"
                devices={outputDevices}
                disabled={isConfigDisabled}
              />
            </CardContent>
          </Card>

          {/* Parameters */}
          <Card className={`shadow-soft border-border/50 transition-all duration-500 ${
            isConfigDisabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
          }`}>
            <CardHeader>
              <CardTitle>Processing Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ParameterSlider
                label="Sample Duration"
                value={sampleDuration}
                onValueChange={setSampleDuration}
                min={2.0}
                max={3.5}
                step={0.1}
                unit="s"
                description="Duration of each audio sample"
                disabled={isConfigDisabled}
              />
              
              <ParameterSlider
                label="Chunk Size"
                value={chunkSize}
                onValueChange={setChunkSize}
                min={0.03}
                max={1.0}
                step={0.01}
                description="Size of processing chunks"
                disabled={isConfigDisabled}
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-card-foreground">
                  Language
                </Label>
                <Select 
                  value={selectedLanguage} 
                  onValueChange={setSelectedLanguage}
                  disabled={isConfigDisabled}
                >
                  <SelectTrigger className="bg-card border-border hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border shadow-lg">
                    {languages.map((language) => (
                      <SelectItem 
                        key={language.value} 
                        value={language.value}
                        className="hover:bg-accent focus:bg-accent"
                      >
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card className="shadow-soft border-border/50">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              {isRunning && (
                <div className="flex items-center space-x-2 text-primary animate-pulse">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium">Processing audio stream...</span>
                </div>
              )}
              
              <Button
                onClick={handleStartStop}
                size="lg"
                variant={isRunning ? "stop" : "start"}
                className="w-48 h-12 text-lg font-semibold"
                disabled={!selectedFile || !selectedInputDevice || !selectedOutputDevice || isWarmingUp}
              >
                {isWarmingUp ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Starting...
                  </>
                ) : isRunning ? (
                  <>
                    <Square className="mr-2 h-5 w-5" />
                    Stop Processing
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Start Processing
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warmup Dialog */}
      <Dialog open={showWarmupDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>System Warming Up</span>
            </DialogTitle>
            <DialogDescription className="text-center">
              Please wait while the audio processing system initializes. This may take a few moments.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}