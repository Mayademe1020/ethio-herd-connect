/**
 * User Testing Infrastructure
 * Utilities for beta testing and user research
 */

import { logger } from './logger';

export interface UserSession {
  id: string;
  startTime: number;
  lastActiveTime: number;
  pageViews: number;
  actions: UserAction[];
  deviceInfo: DeviceInfo;
  networkStatus: 'online' | 'offline';
}

export interface UserAction {
  type: string;
  target?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface DeviceInfo {
  os: string;
  browser: string;
  screenSize: string;
  connectionType: string;
  language: string;
  memory?: string;
}

export interface TestParticipant {
  id: string;
  createdAt: string;
  feedbackCount: number;
  sessionCount: number;
}

const SESSION_STORAGE_KEY = 'user_testing_session';

class UserTestingService {
  private session: UserSession | null = null;
  private sessionId: string = '';
  private eventListeners: Map<string, (action: UserAction) => void> = new Map();

  initialize(): void {
    this.sessionId = this.generateId();
    this.captureSession();
    this.setupEventListeners();
    logger.info('User testing initialized', { sessionId: this.sessionId });
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private captureSession(): void {
    const connection = (navigator as any).connection;
    
    this.session = {
      id: this.sessionId,
      startTime: Date.now(),
      lastActiveTime: Date.now(),
      pageViews: 1,
      actions: [],
      deviceInfo: {
        os: navigator.platform || 'unknown',
        browser: navigator.userAgent || 'unknown',
        screenSize: `${window.screen.width}x${window.screen.height}`,
        connectionType: connection?.effectiveType || 'unknown',
        language: navigator.language || 'unknown',
        memory: (navigator as any).deviceMemory?.toString()
      },
      networkStatus: navigator.onLine ? 'online' : 'offline'
    };

    this.persistSession();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => this.updateNetworkStatus('online'));
    window.addEventListener('offline', () => this.updateNetworkStatus('offline'));
    
    document.addEventListener('click', (e) => this.trackClick(e));
    document.addEventListener('submit', (e) => this.trackFormSubmit(e));
    
    if (typeof window !== 'undefined') {
      const originalPushState = window.history.pushState;
      window.history.pushState = (...args) => {
        originalPushState.apply(window.history, args);
        this.trackPageView();
      };
    }
  }

  private updateNetworkStatus(status: 'online' | 'offline'): void {
    if (this.session) {
      this.session.networkStatus = status;
      this.session.lastActiveTime = Date.now();
      this.persistSession();
    }
  }

  private trackClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const action: UserAction = {
      type: 'click',
      target: target.tagName.toLowerCase() + (target.id ? `#${target.id}` : ''),
      timestamp: Date.now(),
      metadata: {
        text: target.innerText?.substring(0, 50),
        href: target.getAttribute('href')
      }
    };
    this.recordAction(action);
  }

  private trackFormSubmit(event: Event): void {
    const target = event.target as HTMLFormElement;
    const action: UserAction = {
      type: 'form_submit',
      target: target.tagName.toLowerCase() + (target.id ? `#${target.id}` : ''),
      timestamp: Date.now(),
      metadata: {
        action: target.action,
        method: target.method
      }
    };
    this.recordAction(action);
  }

  trackPageView(): void {
    if (this.session) {
      this.session.pageViews++;
      this.session.lastActiveTime = Date.now();
      this.persistSession();
    }
  }

  recordAction(action: UserAction): void {
    if (this.session) {
      this.session.actions.push(action);
      this.session.lastActiveTime = Date.now();
      this.persistSession();
      
      this.eventListeners.forEach((handler) => {
        handler(action);
      });
    }
  }

  onAction(type: string, handler: (action: UserAction) => void): () => void {
    this.eventListeners.set(type, handler);
    return () => this.eventListeners.delete(type);
  }

  getSession(): UserSession | null {
    return this.session;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  private persistSession(): void {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.session));
    } catch (error) {
      logger.warn('Failed to persist session', error);
    }
  }

  exportSessionData(): UserSession | null {
    return this.session;
  }

  clearSession(): void {
    this.session = null;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    logger.info('User testing session cleared');
  }
}

export const userTestingService = new UserTestingService();

export default userTestingService;
