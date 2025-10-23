import { secureLocalStorage } from './securityUtils';
import { encryptData, decryptData } from './securityUtils';
import { logger } from './logger';

interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  priority?: 'high' | 'medium' | 'low';
  cacheTTL?: number; // Time to live in seconds
  requiresAuth?: boolean;
}

interface QueuedRequest extends RequestConfig {
  id: string;
  timestamp: number;
  retryCount: number;
}

/**
 * SecureApiClient - Handles API requests with offline support for Ethiopian farmers
 * Features:
 * - Works offline with request queuing
 * - Encrypts sensitive data in transit
 * - Caches responses for offline use
 * - Prioritizes requests when back online
 * - Handles intermittent connectivity common in rural Ethiopia
 */
export class SecureApiClient {
  private baseUrl: string;
  private requestQueue: QueuedRequest[] = [];
  private isOnline: boolean = navigator.onLine;
  private isProcessingQueue: boolean = false;
  private authToken: string | null = null;
  private maxRetries: number = 5;
  private retryDelay: number = 5000; // 5 seconds
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    
    // Load queued requests from storage
    this.loadQueueFromStorage();
    
    // Set up online/offline listeners
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Try to get auth token from storage
    this.authToken = secureLocalStorage.getItem('auth_token');
  }
  
  /**
   * Set authentication token for API requests
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;
    if (token) {
      secureLocalStorage.setItem('auth_token', token);
    } else {
      secureLocalStorage.removeItem('auth_token');
    }
  }
  
  /**
   * Handle device coming online
   */
  private handleOnline = (): void => {
    this.isOnline = true;
    logger.info('Device is online, processing request queue');
    this.processQueue();
  }
  
  /**
   * Handle device going offline
   */
  private handleOffline = (): void => {
    this.isOnline = false;
    logger.info('Device is offline, requests will be queued');
  }
  
  /**
   * Save the request queue to secure storage
   */
  private saveQueueToStorage(): void {
    const encryptedQueue = encryptData(JSON.stringify(this.requestQueue));
    secureLocalStorage.setItem('api_request_queue', encryptedQueue);
  }
  
  /**
   * Load the request queue from secure storage
   */
  private loadQueueFromStorage(): void {
    try {
      const encryptedQueue = secureLocalStorage.getItem('api_request_queue');
      if (encryptedQueue) {
        const decryptedQueue = decryptData(encryptedQueue);
        this.requestQueue = JSON.parse(decryptedQueue);
      }
    } catch (error) {
      console.error('Failed to load request queue:', error);
      this.requestQueue = [];
    }
  }
  
  /**
   * Add a request to the queue
   */
  private queueRequest(config: RequestConfig): string {
    const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queuedRequest: QueuedRequest = {
      ...config,
      id,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    // Add to queue based on priority
    if (config.priority === 'high') {
      this.requestQueue.unshift(queuedRequest);
    } else {
      this.requestQueue.push(queuedRequest);
    }
    
    this.saveQueueToStorage();
    return id;
  }
  
  /**
   * Process the request queue when online
   */
  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      // Sort queue by priority and timestamp
      this.requestQueue.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const aPriority = priorityOrder[a.priority || 'medium'];
        const bPriority = priorityOrder[b.priority || 'medium'];
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return a.timestamp - b.timestamp;
      });
      
      // Process each request
      const requestsCopy = [...this.requestQueue];
      for (const request of requestsCopy) {
        try {
          await this.executeRequest(request);
          // Remove from queue if successful
          this.requestQueue = this.requestQueue.filter(r => r.id !== request.id);
          this.saveQueueToStorage();
        } catch (error) {
          console.error(`Failed to process queued request ${request.id}:`, error);
          
          // Increment retry count
          const index = this.requestQueue.findIndex(r => r.id === request.id);
          if (index !== -1) {
            this.requestQueue[index].retryCount++;
            
            // Remove if max retries exceeded
            if (this.requestQueue[index].retryCount > this.maxRetries) {
              this.requestQueue.splice(index, 1);
            }
            
            this.saveQueueToStorage();
          }
        }
      }
    } finally {
      this.isProcessingQueue = false;
      
      // If there are still items in the queue, try again later
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), this.retryDelay);
      }
    }
  }
  
  /**
   * Execute a single request
   */
  private async executeRequest(config: RequestConfig): Promise<any> {
    const { url, method, body, headers = {}, requiresAuth = false } = config;
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };
    
    // Add auth token if required
    if (requiresAuth && this.authToken) {
      requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    const requestUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    const response = await fetch(requestUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the response if cacheTTL is specified
    if (config.cacheTTL && config.cacheTTL > 0) {
      this.cacheResponse(config.url, data, config.cacheTTL);
    }
    
    return data;
  }
  
  /**
   * Cache API response for offline use
   */
  private cacheResponse(url: string, data: any, ttl: number): void {
    const cacheKey = `api_cache_${url}`;
    const cacheData = {
      data,
      expires: Date.now() + (ttl * 1000)
    };
    
    secureLocalStorage.setItem(cacheKey, JSON.stringify(cacheData));
  }
  
  /**
   * Get cached response if available and not expired
   */
  private getCachedResponse(url: string): any | null {
    try {
      const cacheKey = `api_cache_${url}`;
      const cacheData = secureLocalStorage.getItem(cacheKey);
      
      if (!cacheData) {
        return null;
      }
      
      const { data, expires } = JSON.parse(cacheData);
      
      if (Date.now() > expires) {
        // Cache expired
        secureLocalStorage.removeItem(cacheKey);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get cached response:', error);
      return null;
    }
  }
  
  /**
   * Make a GET request
   */
  public async get<T>(
    url: string, 
    options: {
      headers?: Record<string, string>;
      cacheTTL?: number;
      requiresAuth?: boolean;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<T> {
    const { headers, cacheTTL = 3600, requiresAuth = false, priority = 'medium' } = options;
    
    // Check cache first
    const cachedData = this.getCachedResponse(url);
    if (cachedData) {
      return cachedData as T;
    }
    
    // If offline, queue the request and return cached data or error
    if (!this.isOnline) {
      this.queueRequest({
        url,
        method: 'GET',
        headers,
        cacheTTL,
        requiresAuth,
        priority
      });
      
      throw new Error('Device is offline. Request queued for later.');
    }
    
    try {
      return await this.executeRequest({
        url,
        method: 'GET',
        headers,
        cacheTTL,
        requiresAuth
      });
    } catch (error) {
      // If request fails, queue it for later
      this.queueRequest({
        url,
        method: 'GET',
        headers,
        cacheTTL,
        requiresAuth,
        priority
      });
      
      throw error;
    }
  }
  
  /**
   * Make a POST request
   */
  public async post<T>(
    url: string,
    body: any,
    options: {
      headers?: Record<string, string>;
      cacheTTL?: number;
      requiresAuth?: boolean;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<T> {
    const { headers, cacheTTL, requiresAuth = true, priority = 'medium' } = options;
    
    // If offline, queue the request
    if (!this.isOnline) {
      this.queueRequest({
        url,
        method: 'POST',
        body,
        headers,
        cacheTTL,
        requiresAuth,
        priority
      });
      
      throw new Error('Device is offline. Request queued for later.');
    }
    
    try {
      return await this.executeRequest({
        url,
        method: 'POST',
        body,
        headers,
        cacheTTL,
        requiresAuth
      });
    } catch (error) {
      // If request fails, queue it for later
      this.queueRequest({
        url,
        method: 'POST',
        body,
        headers,
        cacheTTL,
        requiresAuth,
        priority
      });
      
      throw error;
    }
  }
  
  /**
   * Make a PUT request
   */
  public async put<T>(
    url: string,
    body: any,
    options: {
      headers?: Record<string, string>;
      cacheTTL?: number;
      requiresAuth?: boolean;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<T> {
    const { headers, cacheTTL, requiresAuth = true, priority = 'medium' } = options;
    
    // If offline, queue the request
    if (!this.isOnline) {
      this.queueRequest({
        url,
        method: 'PUT',
        body,
        headers,
        cacheTTL,
        requiresAuth,
        priority
      });
      
      throw new Error('Device is offline. Request queued for later.');
    }
    
    try {
      return await this.executeRequest({
        url,
        method: 'PUT',
        body,
        headers,
        cacheTTL,
        requiresAuth
      });
    } catch (error) {
      // If request fails, queue it for later
      this.queueRequest({
        url,
        method: 'PUT',
        body,
        headers,
        cacheTTL,
        requiresAuth,
        priority
      });
      
      throw error;
    }
  }
  
  /**
   * Make a DELETE request
   */
  public async delete<T>(
    url: string,
    options: {
      headers?: Record<string, string>;
      requiresAuth?: boolean;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<T> {
    const { headers, requiresAuth = true, priority = 'medium' } = options;
    
    // If offline, queue the request
    if (!this.isOnline) {
      this.queueRequest({
        url,
        method: 'DELETE',
        headers,
        requiresAuth,
        priority
      });
      
      throw new Error('Device is offline. Request queued for later.');
    }
    
    try {
      return await this.executeRequest({
        url,
        method: 'DELETE',
        headers,
        requiresAuth
      });
    } catch (error) {
      // If request fails, queue it for later
      this.queueRequest({
        url,
        method: 'DELETE',
        headers,
        requiresAuth,
        priority
      });
      
      throw error;
    }
  }
  
  /**
   * Get the current online status
   */
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }
  
  /**
   * Get the number of pending requests
   */
  public getPendingRequestCount(): number {
    return this.requestQueue.length;
  }
  
  /**
   * Clear all pending requests
   */
  public clearRequestQueue(): void {
    this.requestQueue = [];
    this.saveQueueToStorage();
  }
  
  /**
   * Clean up event listeners
   */
  public destroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

// Create and export a default instance
const apiClient = new SecureApiClient(import.meta.env.VITE_API_BASE_URL || 'https://api.ethioherdconnect.com');
export default apiClient;