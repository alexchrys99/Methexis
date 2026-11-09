import { useEffect, useState } from "react";

/**
 * Handles Web Bluetooth device connection and subtitle streaming.
 *
 * If BLE is not supported, logs a friendly message and falls back to software HUD.
 */
export default function useBluetooth() {
  const [bleConnected, setBleConnected] = useState(false);
  const [bleCharacteristic, setBleCharacteristic] = useState(null);
  const [bleError, setBleError] = useState(null);

  useEffect(() => {
    const handleBluetooth = async () => {
      try {
        // Check if Web Bluetooth is supported
        if (!navigator.bluetooth) {
          console.log("Web Bluetooth not supported — running in software HUD mode.");
          return;
        }

        // Request device connection
        const device = await navigator.bluetooth.requestDevice({
          optionalServices: [
            "6e400001-b5a3-f393-e0a9-e50e24dcca9e", // UART service UUID
            "0000180d-0000-1000-8000-00805f9b34fb", // Generic Attribute Profile (GATT)
          ],
          filters: [],
          buttonLabel: "Connect Glasses",
        });

        // Enable device
        await device.enable();

        // Discover services
        const services = await device.getPrimaryServices();

        // Look for UART service (or generic GATT service)
        const uartService = services.find(service => {
          const serviceUUID = service.uuid.toString();
          return serviceUUID === "6e400001-b5a3-f393-e0a9-e50e24dcca9e" ||
                 serviceUUID === "0000180d-0000-1000-8000-00805f9b34fb";
        });

        if (!uartService) {
          console.log("No UART service found — falling back to software HUD.");
          return;
        }

        // Discover characteristics
        const characteristics = await uartService.getCharacteristics();

        // Find the primary characteristic for writing text
        const writeCharacteristic = characteristics.find(char => {
          const charUUID = char.uuid.toString();
          return charUUID === "6e400002-b5a3-f393-e0a9-e50e24dcca9e" ||
                 charUUID === "00002a00-0000-1000-8000-00805f9b34fb";
        });

        if (!writeCharacteristic) {
          console.log("No write characteristic found — falling back to software HUD.");
          return;
        }

        // Set up connection
        const connectionManager = device.createGattServer();
        const connection = await connectionManager.connect(device);
        const gattServer = await connectionManager.getServer();

        // Discover the service
        const discoveredService = await gattServer.getService(uartService.uuid);
        const discoveredCharacteristic = await discoveredService.getCharacteristic(writeCharacteristic.uuid);

        // Store reference
        setBleConnected(true);
        setBleCharacteristic(discoveredCharacteristic);

        // Cleanup on unmount
        return () => {
          connection.close();
        };
      } catch (error) {
        console.error("BLE connection error:", error);
        setBleError(error.message);
      }
    };

    handleBluetooth();

    return () => {}; // No cleanup needed for async
  }, []);

  return { bleConnected, bleCharacteristic, bleError };
}