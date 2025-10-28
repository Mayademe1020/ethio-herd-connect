/**
 * Network Simulator for Testing
 * Simulates various network conditions for device testing
 */

export type NetworkCondition = '2g' | '3g' | '4g' | 'offline' | 'online';

export interface NetworkProfile {
  name: string;
  downloadSpeed: number; // Kbps
  uploadSpeed: number; // Kbps
  latency: number; // ms
  packetLoss: number; // percentage
}

export const NETWORK_PROFILES: Record<NetworkCondition, NetworkProfile> = {
  offline: {
    name: 'Offline',
    downloadSpeed: 0,
    uploadSpeed: 0,
    latency: 0,
    packetLoss: 100
  },
  '2g': {
    name: 'Slow 2G',
    downloadSpeed: 50, // 50 Kbps
    uploadSpeed: 20, // 20 Kbps
    latency: 2000, // 2 seconds
    packetLoss: 5
  },
  '3g': {
    name: 'Fast 3G',
    downloadSpeed: 1600, // 1.6 Mbps
    uploadSpeed: 750, // 750 Kbps
    latency: 150, // 150ms
    packetLoss: 1
  },
  '4g': {
    name: '4G',
    downloadSpeed: 10000, // 10 Mbps
    uploadSpeed: 5000, // 5 Mbps
    latency: 50, // 50ms
    packetLoss: 0
  },
  online: {
    name: 'Online (No Throttling)',
    downloadSpeed: Infinity,
    uploadSpeed: Infinity,
    latency: 0,
    packetLoss: 0
  }
};

class NetworkSimulator {
  private currentCondition: NetworkCondition = 'online';
  private originalFetch: typeof fetch;
  private isSimulating = false;

  constructor() {
    this.originalFetch = window.fetch.bind(window);
  }

  /**
   * Start simulating network condition
   */
  simulate(condition: NetworkCondition): void {
    if (this.isSimulating) {
      this.stop();
    }

    this.currentCondition = condition;
    this.isSimulating = true;

    const profile = NETWORK_PROFILES[condition];
    console.log(`🌐 Simulating ${profile.name}:`, {
      download: `${profile.downloadSpeed} Kbps`,
      upload: `${profile.uploadSpeed} Kbps`,
      latency: `${profile.latency}ms`,
      packetLoss: `${profile.packetLoss}%`
    });

    // Override fetch
    window.fetch = this.createThrottledFetch(profile);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('network-simulation-start', {
      detail: { condition, profile }
    }));
  }

  /**
   * Stop simulation and restore normal fetch
   */
  stop(): void {
    if (!this.isSimulating) return;

    window.fetch = this.originalFetch;
    this.isSimulating = false;
    this.currentCondition = 'online';

    console.log('🌐 Network simulation stopped');

    window.dispatchEvent(new CustomEvent('network-simulation-stop'));
  }

  /**
   * Create throttled fetch function
   */
  private createThrottledFetch(profile: NetworkProfile): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // Simulate offline
      if (profile.packetLoss === 100) {
        await this.delay(100);
        throw new Error('Network request failed: Offline');
      }

      // Simulate packet loss
      if (Math.random() * 100 < profile.packetLoss) {
        await this.delay(profile.latency);
        throw new Error('Network request failed: Packet loss');
      }

      // Add latency
      await this.delay(profile.latency);

      // Make actual request
      const startTime = Date.now();
      const response = await this.originalFetch(input, init);

      // Clone response to read body
      const clonedResponse = response.clone();
      const blob = await clonedResponse.blob();
      const sizeBytes = blob.size;

      // Calculate throttled delay based on download speed
      const downloadTimeMs = (sizeBytes * 8) / profile.downloadSpeed; // Convert to ms
      const actualTime = Date.now() - startTime;
      const additionalDelay = Math.max(0, downloadTimeMs - actualTime);

      if (additionalDelay > 0) {
        await this.delay(additionalDelay);
      }

      return response;
    };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current condition
   */
  getCurrentCondition(): NetworkCondition {
    return this.currentCondition;
  }

  /**
   * Check if simulation is active
   */
  isActive(): boolean {
    return this.isSimulating;
  }

  /**
   * Get current profile
   */
  getCurrentProfile(): NetworkProfile {
    return NETWORK_PROFILES[this.currentCondition];
  }

  /**
   * Test network speed
   */
  async testSpeed(): Promise<{
    downloadSpeed: number;
    latency: number;
  }> {
    const testUrl = 'https://httpbin.org/bytes/100000'; // 100KB test file
    
    // Test latency
    const latencyStart = Date.now();
    await fetch('https://httpbin.org/get');
    const latency = Date.now() - latencyStart;

    // Test download speed
    const downloadStart = Date.now();
    const response = await fetch(testUrl);
    const blob = await response.blob();
    const downloadTime = Date.now() - downloadStart;
    
    const sizeBytes = blob.size;
    const downloadSpeed = (sizeBytes * 8) / (downloadTime / 1000) / 1000; // Kbps

    return {
      downloadSpeed: Math.round(downloadSpeed),
      latency: Math.round(latency)
    };
  }

  /**
   * Simulate intermittent connection
   */
  simulateIntermittent(onDuration: number = 5000, offDuration: number = 2000): void {
    let isOn = true;

    const toggle = () => {
      if (isOn) {
        this.simulate('offline');
        setTimeout(toggle, offDuration);
      } else {
        this.simulate('3g');
        setTimeout(toggle, onDuration);
      }
      isOn = !isOn;
    };

    toggle();
  }
}

// Create singleton instance
export const networkSimulator = new NetworkSimulator();

// Expose to window for manual testing
if (typeof window !== 'undefined') {
  (window as any).networkSimulator = networkSimulator;
  
  // Add keyboard shortcuts for quick testing
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+N for network menu
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
      showNetworkMenu();
    }
  });
}

/**
 * Show network simulation menu
 */
function showNetworkMenu(): void {
  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 2px solid #333;
    border-radius: 8px;
    padding: 20px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    font-family: system-ui, -apple-system, sans-serif;
  `;

  const title = document.createElement('h3');
  title.textContent = '🌐 Network Simulator';
  title.style.marginTop = '0';
  menu.appendChild(title);

  const conditions: NetworkCondition[] = ['online', '4g', '3g', '2g', 'offline'];
  
  conditions.forEach(condition => {
    const button = document.createElement('button');
    const profile = NETWORK_PROFILES[condition];
    button.textContent = `${profile.name} (${profile.latency}ms, ${profile.downloadSpeed} Kbps)`;
    button.style.cssText = `
      display: block;
      width: 100%;
      padding: 10px;
      margin: 5px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: ${networkSimulator.getCurrentCondition() === condition ? '#4CAF50' : '#f5f5f5'};
      color: ${networkSimulator.getCurrentCondition() === condition ? 'white' : 'black'};
      cursor: pointer;
      font-size: 14px;
    `;
    
    button.onclick = () => {
      if (condition === 'online') {
        networkSimulator.stop();
      } else {
        networkSimulator.simulate(condition);
      }
      document.body.removeChild(menu);
    };
    
    menu.appendChild(button);
  });

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.cssText = `
    display: block;
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #f5f5f5;
    cursor: pointer;
  `;
  closeButton.onclick = () => document.body.removeChild(menu);
  menu.appendChild(closeButton);

  document.body.appendChild(menu);
}

/**
 * Helper function to log network info
 */
export function logNetworkInfo(): void {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;

  console.group('🌐 Network Information');
  console.log('Online:', navigator.onLine);
  
  if (connection) {
    console.log('Effective Type:', connection.effectiveType);
    console.log('Downlink:', `${connection.downlink} Mbps`);
    console.log('RTT:', `${connection.rtt}ms`);
    console.log('Save Data:', connection.saveData);
  } else {
    console.log('Network Information API not supported');
  }
  
  if (networkSimulator.isActive()) {
    const profile = networkSimulator.getCurrentProfile();
    console.log('⚠️ SIMULATION ACTIVE:', profile.name);
  }
  
  console.groupEnd();
}

// Auto-log network info on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(logNetworkInfo, 1000);
  });
}
