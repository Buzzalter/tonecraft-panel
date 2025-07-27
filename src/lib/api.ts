interface AudioConfig {
  diffusionSteps: number;
  chunkSize: number;
  crossfade: number;
  extraContext: number;
  inputDevice: string;
  outputDevice: string;
  referenceAudio?: File;
}

interface Device {
  id: string;
  name: string;
}

const API_BASE_URL = 'http://localhost:8000'; // Adjust to your FastAPI backend URL

export const audioAPI = {
  async start(config: AudioConfig): Promise<void> {
    const formData = new FormData();
    
    // Add config parameters
    formData.append('diffusion_steps', config.diffusionSteps.toString());
    formData.append('chunk_size', config.chunkSize.toString());
    formData.append('crossfade', config.crossfade.toString());
    formData.append('extra_context', config.extraContext.toString());
    formData.append('input_device', config.inputDevice);
    formData.append('output_device', config.outputDevice);
    
    // Add reference audio file if provided
    if (config.referenceAudio) {
      formData.append('reference_audio', config.referenceAudio);
    }

    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to start: ${response.statusText}`);
    }
  },

  async stop(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/stop`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to stop: ${response.statusText}`);
    }
  },

  async updateConfig(config: Partial<AudioConfig>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to update config: ${response.statusText}`);
    }
  },

  async detectDevices(): Promise<{ inputDevices: Device[]; outputDevices: Device[] }> {
    const response = await fetch(`${API_BASE_URL}/detect-devices`);

    if (!response.ok) {
      throw new Error(`Failed to detect devices: ${response.statusText}`);
    }

    return response.json();
  }
};