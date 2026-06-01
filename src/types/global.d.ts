// Browser API type declarations for EthioHerd Connect
// Eliminates repetitive `as any` casts for non-standard browser APIs

interface NetworkInformation {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
  removeEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
}

interface BatteryManager {
  level: number;
  charging: boolean;
  addEventListener(type: 'levelchange' | 'chargingchange', handler: () => void): void;
}

interface Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  deviceMemory?: number;
  getBattery(): Promise<BatteryManager>;
}

interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface Window {
  gtag?: (...args: unknown[]) => void;
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  networkSimulator?: { setProfile: (profile: string) => void; stop: () => void };
  performanceMonitor?: import('@/utils/performanceMonitor').PerformanceMonitorInstance;
  gsap?: { set: (target: string, vars: Record<string, unknown>) => void };
}


interface NetworkInformation {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
  removeEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
}

interface Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  deviceMemory?: number;
  getBattery(): Promise<{ level: number; charging: boolean; addEventListener: (type: string, handler: () => void) => void }>;
}

interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Web Speech API (non-standard, vendor-prefixed)
interface SpeechRecognitionResult {
  readonly transcript: string;
  readonly confidence: number;
  readonly isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  readonly resultIndex: number;
  [index: number]: SpeechRecognitionResult;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface SpeechRecognitionResultAlt {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

interface Window {
  gtag?: (...args: unknown[]) => void;
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  networkSimulator?: { setProfile: (profile: string) => void; stop: () => void };
  performanceMonitor?: { trackComponent: (name: string) => void; trackApiCall: (name: string, duration: number) => void };
  gsap?: unknown;
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}


