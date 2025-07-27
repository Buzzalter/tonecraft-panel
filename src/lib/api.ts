interface AudioConfig {
  sampleDuration: number;
  chunkSize: number;
  inputDevice: string;
  outputDevice: string;
  language: string;
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
    formData.append('sample_duration', config.sampleDuration.toString());
    formData.append('chunk_size', config.chunkSize.toString());
    formData.append('input_device', config.inputDevice);
    formData.append('output_device', config.outputDevice);
    formData.append('language', config.language);
    
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