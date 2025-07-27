import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AudioUpload } from '@/components/AudioUpload';
import { AudioPreview } from '@/components/AudioPreview';
import { DeviceSelector } from '@/components/DeviceSelector';
import { ParameterSlider } from '@/components/ParameterSlider';
import { Play, Square, RefreshCw } from 'lucide-react';
import { audioAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputDevice, setInputDevice] = useState('');
  const [outputDevice, setOutputDevice] = useState('');
  const [diffusionSteps, setDiffusionSteps] = useState(20);
  const [chunkSize, setChunkSize] = useState(0.5);
  const [crossfade, setCrossfade] = useState(0.25);
  const [extraContext, setExtraContext] = useState(0.2);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputDevices, setInputDevices] = useState<{ id: string; name: string }[]>([]);
  const [outputDevices, setOutputDevices] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  // Load devices on component mount
  useEffect(() => {
    loadDevices();
  }, []);

  // Send config updates to backend when parameters change
  useEffect(() => {
    if (inputDevice || outputDevice || selectedFile) {
      const config = {
        diffusionSteps,
        chunkSize,
        crossfade,
        extraContext,
        inputDevice,
        outputDevice,
      };
      
      // Debounce config updates
      const timer = setTimeout(() => {
        audioAPI.updateConfig(config).catch(error => {
          console.error('Failed to update config:', error);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [diffusionSteps, chunkSize, crossfade, extraContext, inputDevice, outputDevice]);

  const loadDevices = async () => {
    try {
      const devices = await audioAPI.detectDevices();
      setInputDevices(devices.inputDevices);
      setOutputDevices(devices.outputDevices);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to detect audio devices. Using defaults.",
        variant: "destructive",
      });
      // Fallback to mock devices
      setInputDevices([
        { id: 'default', name: 'Default Microphone' },
        { id: 'mic1', name: 'USB Microphone' },
        { id: 'mic2', name: 'Built-in Microphone' },
      ]);
      setOutputDevices([
        { id: 'default', name: 'Default Speakers' },
        { id: 'speakers1', name: 'Desktop Speakers' },
        { id: 'headphones', name: 'Bluetooth Headphones' },
      ]);
    }
  };

  const handleStartStop = async () => {
    if (isRunning) {
      setIsLoading(true);
      try {
        await audioAPI.stop();
        setIsRunning(false);
        toast({
          title: "Success",
          description: "Audio processing stopped.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to stop processing.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const config = {
          sampleDuration: diffusionSteps,
          chunkSize,
          inputDevice,
          outputDevice,
          language: 'en',
          referenceAudio: selectedFile || undefined,
        };
        
        await audioAPI.start(config);
        setIsRunning(true);
        toast({
          title: "Success",
          description: "Audio processing started.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start processing.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            EXAMPLE
          </h1>
          <p className="text-muted-foreground text-lg">
            Audio Processing Configuration
          </p>
        </div>

        {/* Audio Upload Section */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground">Reference Audio</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFile ? (
              <AudioPreview 
                file={selectedFile} 
                onRemove={() => setSelectedFile(null)} 
              />
            ) : (
              <AudioUpload 
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
              />
            )}
          </CardContent>
        </Card>

        {/* Device Configuration */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground">Audio Devices</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DeviceSelector
              label="Input Device"
              value={inputDevice}
              onValueChange={setInputDevice}
              type="input"
              devices={inputDevices}
            />
            <DeviceSelector
              label="Output Device"
              value={outputDevice}
              onValueChange={setOutputDevice}
              type="output"
              devices={outputDevices}
            />
          </CardContent>
        </Card>

        {/* Parameters */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground">Processing Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ParameterSlider
                label="Diffusion Steps"
                value={diffusionSteps}
                onValueChange={setDiffusionSteps}
                min={1}
                max={40}
                step={1}
                description="Higher values provide better quality but slower processing"
              />
              <ParameterSlider
                label="Chunk Size"
                value={chunkSize}
                onValueChange={setChunkSize}
                min={0.1}
                max={0.85}
                step={0.05}
                description="Size of audio chunks processed at once"
              />
            </div>
            
            <Separator className="bg-border/50" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ParameterSlider
                label="Crossfade"
                value={crossfade}
                onValueChange={setCrossfade}
                min={0.1}
                max={0.45}
                step={0.05}
                description="Smooth transition between audio chunks"
              />
              <ParameterSlider
                label="Extra Context"
                value={extraContext}
                onValueChange={setExtraContext}
                min={0.1}
                max={0.35}
                step={0.05}
                description="Additional context for better processing continuity"
              />
            </div>
          </CardContent>
        </Card>

        {/* Control Button */}
        <div className="flex justify-center">
          <Button
            variant={isRunning ? "stop" : "start"}
            size="lg"
            onClick={handleStartStop}
            className="text-lg px-12 py-6 h-auto"
            disabled={!selectedFile || !inputDevice || !outputDevice || isLoading}
          >
            {isRunning ? (
              <>
                <Square className="h-5 w-5 mr-2" />
                Stop Processing
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start Processing
              </>
            )}
          </Button>
        </div>

        {/* Status Indicator */}
        {isRunning && (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-primary/10 to-primary-glow/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <span className="text-primary font-medium">Processing audio stream...</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;