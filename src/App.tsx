import React, { useState, useCallback, useRef, useEffect } from 'react';

// Define a type for log entries
type LogEntry = {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
};

// Default export of the React component
export default function RabbitMQConsumer() {
  // --- State Variables ---
  const [exchange, setExchange] = useState<string>('amq.direct');
  const [queue, setQueue] = useState<string>('my_queue');
  const [user, setUser] = useState<string>('guest');
  const [password, setPassword] = useState<string>('guest');
  const [host, setHost] = useState<string>('localhost'); // Added Host input
  const [port, setPort] = useState<string>('5672'); // Added Port input

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConsuming, setIsConsuming] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Ref for simulating message consumption interval
  const consumeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Ref for simulating connection timeout
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Logging Helper ---
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [{ timestamp, message, type }, ...prevLogs.slice(0, 99)]); // Keep last 100 logs
  }, []);

  // --- Cleanup on Unmount ---
  useEffect(() => {
    return () => {
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      if (consumeIntervalRef.current) clearInterval(consumeIntervalRef.current);
      // Add cleanup for actual connection if it were implemented
      addLog('Component unmounted, cleaning up.', 'warning');
    };
  }, [addLog]);

  // --- Event Handlers ---
  const handleConnect = useCallback(() => {
    setIsConnecting(true);
    addLog(`Attempting to connect to ${host}:${port}...`, 'info');
    addLog(`(Simulated) Using Exchange: ${exchange}, Queue: ${queue}, User: ${user}`, 'info');

    // Simulate connection delay and success/failure
    connectTimeoutRef.current = setTimeout(() => {
      // Basic validation simulation
      if (!host || !port || !exchange || !queue || !user || !password) {
          addLog('Connection Failed: Missing configuration details.', 'error');
          setIsConnecting(false);
          return;
      }

      // Simulate success
      setIsConnected(true);
      setIsConnecting(false);
      addLog('Connection successful (Simulated).', 'success');
    }, 2000); // Simulate 2 seconds delay

  }, [host, port, exchange, queue, user, password, addLog]);

  const handleDisconnect = useCallback(() => {
    addLog('Disconnecting...', 'warning');
    if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current); // Cancel pending connection
    if (consumeIntervalRef.current) {
      clearInterval(consumeIntervalRef.current);
      consumeIntervalRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsConsuming(false);
    // In a real app, close the RabbitMQ connection here
    addLog('Disconnected (Simulated).', 'warning');
  }, [addLog]);

  const handleStartConsume = useCallback(() => {
    if (!isConnected) {
      addLog('Cannot start consuming: Not connected.', 'error');
      return;
    }
    addLog(`Starting consumption from queue: ${queue} (Simulated)...`, 'info');
    setIsConsuming(true);

    // Simulate receiving messages periodically
    consumeIntervalRef.current = setInterval(() => {
      const newMessage = `[${new Date().toLocaleTimeString()}] Simulated Message ${Math.random().toString(36).substring(7)}`;
      setMessages(prevMessages => [newMessage, ...prevMessages.slice(0, 49)]); // Keep last 50 messages
    }, 3000); // New message every 3 seconds

  }, [isConnected, queue, addLog]);

  const handleStopConsume = useCallback(() => {
    if (!isConsuming) return;
    addLog('Stopping consumption (Simulated)...', 'warning');
    if (consumeIntervalRef.current) {
      clearInterval(consumeIntervalRef.current);
      consumeIntervalRef.current = null;
    }
    setIsConsuming(false);
    addLog('Consumption stopped.', 'info');
  }, [isConsuming, addLog]);

  const handleReset = useCallback(() => {
    addLog('Resetting configuration and state...', 'warning');
    handleDisconnect(); // Ensure disconnection and stop consumption
    setExchange('amq.direct');
    setQueue('my_queue');
    setUser('guest');
    setPassword('guest');
    setHost('localhost');
    setPort('5672');
    setMessages([]);
    setLogs([]);
    addLog('Reset complete.', 'info');
  }, [handleDisconnect, addLog]);

  // --- Input Change Handlers ---
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
    };

  // --- Dynamic Styling ---
  const getStatusColor = () => {
    if (isConnecting) return 'text-yellow-600';
    if (isConnected) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

   const getConsumeStatusColor = () => {
    if (isConsuming) return 'text-blue-600';
    return 'text-gray-600';
  };

   const getConsumeStatusText = () => {
    if (isConsuming) return 'Consuming';
    return 'Idle';
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-500';
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'info':
      default: return 'text-gray-700';
    }
  };

  // --- Render ---
  return (
    <div className="container mx-auto p-4 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">RabbitMQ Consumer Interface (Simulated)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Configuration Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="host" className="block text-sm font-medium text-gray-600 mb-1">Host</label>
              <input
                id="host"
                type="text"
                value={host}
                onChange={handleInputChange(setHost)}
                disabled={isConnected || isConnecting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., localhost or 192.168.1.100"
              />
            </div>
             <div>
              <label htmlFor="port" className="block text-sm font-medium text-gray-600 mb-1">Port</label>
              <input
                id="port"
                type="text"
                value={port}
                onChange={handleInputChange(setPort)}
                disabled={isConnected || isConnecting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., 5672"
              />
            </div>
            <div>
              <label htmlFor="exchange" className="block text-sm font-medium text-gray-600 mb-1">Exchange Name</label>
              <input
                id="exchange"
                type="text"
                value={exchange}
                onChange={handleInputChange(setExchange)}
                disabled={isConnected || isConnecting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., amq.direct"
              />
            </div>
            <div>
              <label htmlFor="queue" className="block text-sm font-medium text-gray-600 mb-1">Queue Name</label>
              <input
                id="queue"
                type="text"
                value={queue}
                onChange={handleInputChange(setQueue)}
                disabled={isConnected || isConnecting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., my_app_queue"
              />
            </div>
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-600 mb-1">Username</label>
              <input
                id="user"
                type="text"
                value={user}
                onChange={handleInputChange(setUser)}
                disabled={isConnected || isConnecting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., guest"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handleInputChange(setPassword)}
                disabled={isConnected || isConnecting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter password"
              />
            </div>
          </div>
        </div>

        {/* Controls and Status Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col space-y-6">
           <h2 className="text-xl font-medium text-gray-700 mb-2">Controls & Status</h2>

           {/* Status Display */}
           <div className="flex justify-around items-center bg-gray-100 p-3 rounded-md border border-gray-200">
                <div>
                    <span className="text-sm font-medium text-gray-500">Connection: </span>
                    <span className={`font-semibold ${getStatusColor()}`}>{getStatusText()}</span>
                </div>
                 <div>
                    <span className="text-sm font-medium text-gray-500">Consumer: </span>
                    <span className={`font-semibold ${getConsumeStatusColor()}`}>{getConsumeStatusText()}</span>
                </div>
           </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleConnect}
              disabled={isConnected || isConnecting}
              className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
             <button
              onClick={handleDisconnect}
              disabled={!isConnected && !isConnecting}
              className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Disconnect
            </button>
             <button
              onClick={handleStartConsume}
              disabled={!isConnected || isConsuming || isConnecting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Consume
            </button>
             <button
              onClick={handleStopConsume}
              disabled={!isConsuming || isConnecting}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Stop Consume
            </button>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-200">
             <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
                Reset All
            </button>
          </div>
        </div>
      </div>

      {/* Messages Display */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-medium text-gray-700 mb-4">Received Messages ({messages.length})</h2>
        <div className="h-64 overflow-y-auto bg-gray-50 border border-gray-200 rounded-md p-4 space-y-2 text-sm font-mono">
          {messages.length === 0 && <p className="text-gray-500 italic">No messages received yet.</p>}
          {messages.map((msg, index) => (
            <p key={index} className="text-gray-800 border-b border-gray-100 pb-1">{msg}</p>
          ))}
        </div>
      </div>

      {/* Logs Display */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-medium text-gray-700 mb-4">Activity Logs</h2>
        <div className="h-48 overflow-y-auto bg-gray-50 border border-gray-200 rounded-md p-4 space-y-1 text-xs font-mono">
          {logs.length === 0 && <p className="text-gray-500 italic">No activity logs yet.</p>}
          {logs.map((log, index) => (
            <p key={index} className={`${getLogColor(log.type)}`}>
              <span className="text-gray-400 mr-2">{log.timestamp}</span>
              {log.message}
            </p>
          ))}
        </div>
      </div>

    </div>
  );
}