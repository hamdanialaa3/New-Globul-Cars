import { IoTDataPlaneClient, PublishCommand, GetThingShadowCommand } from '@aws-sdk/client-iot-data-plane';
import { IoTClient, CreateThingCommand, AttachThingPrincipalCommand } from '@aws-sdk/client-iot';

export interface CarTelemetryData {
  carId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  engineStatus: 'on' | 'off';
  fuelLevel: number;
  speed: number;
  temperature: number;
  timestamp: number;
  isOnline: boolean;
}

export interface CarIoTDevice {
  thingName: string;
  certificateArn: string;
  status: 'connected' | 'disconnected';
  lastSeen: Date;
}

class IoTService {
  private iotDataClient: IoTDataPlaneClient;
  private iotClient: IoTClient;
  private endpoint: string;

  constructor() {
    this.endpoint = process.env.REACT_APP_IOT_ENDPOINT || '';
    
    this.iotDataClient = new IoTDataPlaneClient({
      region: process.env.REACT_APP_AWS_REGION || 'eu-central-1',
      endpoint: `https://${this.endpoint}`
    });

    this.iotClient = new IoTClient({
      region: process.env.REACT_APP_AWS_REGION || 'eu-central-1'
    });
  }

  async publishCarTelemetry(carId: string, data: Omit<CarTelemetryData, 'carId' | 'timestamp'>): Promise<void> {
    const telemetryData: CarTelemetryData = {
      carId,
      ...data,
      timestamp: Date.now()
    };

    const command = new PublishCommand({
      topic: `cars/${carId}/telemetry`,
      payload: JSON.stringify(telemetryData)
    });

    await this.iotDataClient.send(command);
  }

  async getCarShadow(carId: string): Promise<any> {
    const command = new GetThingShadowCommand({
      thingName: carId
    });

    const response = await this.iotDataClient.send(command);
    return JSON.parse(new TextDecoder().decode(response.payload));
  }

  async createCarDevice(carId: string): Promise<CarIoTDevice> {
    const command = new CreateThingCommand({
      thingName: carId,
      thingTypeName: 'CarDevice'
    });

    await this.iotClient.send(command);

    return {
      thingName: carId,
      certificateArn: '',
      status: 'disconnected',
      lastSeen: new Date()
    };
  }

  subscribeToCarUpdates(carId: string, callback: (data: CarTelemetryData) => void): () => void {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(`wss://${this.endpoint}/mqtt`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        topic: `cars/${carId}/telemetry`
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    return () => ws.close();
  }
}

export const iotService = new IoTService();