import { useState, useEffect } from 'react';
import { iotService, CarTelemetryData } from '../services/legacy/iot-service.stub';

export const useCarIoT = (carId: string) => {
  const [telemetryData, setTelemetryData] = useState<CarTelemetryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!carId) return;

    const unsubscribe = iotService.subscribeToCarUpdates(carId, (data) => {
      setTelemetryData(data);
      setIsConnected(data.isOnline);
      setLastUpdate(new Date(data.timestamp));
    });

    // Get initial shadow state
    iotService.getCarShadow(carId)
      .then(shadow => {
        if (shadow.state?.reported) {
          setTelemetryData(shadow.state.reported);
          setIsConnected(true);
        }
      })
      .catch(() => setIsConnected(false));

    return unsubscribe;
  }, [carId]);

  return {
    telemetryData,
    isConnected,
    lastUpdate
  };
};