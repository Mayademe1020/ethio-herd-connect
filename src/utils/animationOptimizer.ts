/**
 * Animation Optimizer for Battery Conservation
 * Reduces animations on low-end devices and low battery
 */

interface DeviceCapabilities {
  isLowEnd: boolean;
  batteryLevel: number | null;
  prefersReducedMotion: boolean;
  memoryPressure: 'low' | 'medium' | 'high';
}

class AnimationOptimizer {
  private static instance: AnimationOptimizer;
  private capabilities: DeviceCapabilities;
  private animationObserver: IntersectionObserver | null = null;

  private constructor() {
    this.capabilities = this.detectCapabilities();
    this.initializeOptimization();
  }

  static getInstance(): AnimationOptimizer {
    if (!AnimationOptimizer.instance) {
      AnimationOptimizer.instance = new AnimationOptimizer();
    }
    return AnimationOptimizer.instance;
  }

  private detectCapabilities(): DeviceCapabilities {
    // Detect low-end device
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const deviceMemory = (navigator as any).deviceMemory || 1;
    const isLowEnd = hardwareConcurrency <= 2 || deviceMemory <= 2;

    // Check battery level
    let batteryLevel: number | null = null;
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryLevel = battery.level * 100;
        this.capabilities.batteryLevel = batteryLevel;
      });
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      isLowEnd,
      batteryLevel,
      prefersReducedMotion,
      memoryPressure: 'medium' // Will be updated by memory monitor
    };
  }

  private initializeOptimization(): void {
    // Disable animations based on capabilities
    this.applyAnimationOptimizations();

    // Set up intersection observer for lazy animations
    this.setupLazyAnimations();

    // Monitor battery changes
    this.monitorBatteryChanges();

    // Listen for memory pressure
    this.monitorMemoryPressure();
  }

  private applyAnimationOptimizations(): void {
    const shouldReduceAnimations = this.shouldReduceAnimations();

    if (shouldReduceAnimations) {
      // Disable CSS transitions and animations
      this.disableCSSTransitions();

      // Reduce motion in components
      this.applyReducedMotion();

      // Disable complex animations
      document.documentElement.classList.add('reduced-animations');
    }
  }

  private shouldReduceAnimations(): boolean {
    return (
      this.capabilities.prefersReducedMotion ||
      this.capabilities.isLowEnd ||
      (this.capabilities.batteryLevel !== null && this.capabilities.batteryLevel < 20) ||
      this.capabilities.memoryPressure === 'high'
    );
  }

  private disableCSSTransitions(): void {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }

      .no-animation {
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  private applyReducedMotion(): void {
    // Override common animation libraries
    if ((window as any).gsap) {
      (window as any).gsap.set('*', { duration: 0 });
    }

    // Disable Framer Motion animations
    document.documentElement.style.setProperty('--framer-motion-duration', '0s');
  }

  private setupLazyAnimations(): void {
    // Only animate elements when they come into view
    this.animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          if (element.hasAttribute('data-animate-on-visible')) {
            element.classList.add('animate-in');
            this.animationObserver?.unobserve(element);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observe elements with animation triggers
    setTimeout(() => {
      const animatedElements = document.querySelectorAll('[data-animate-on-visible]');
      animatedElements.forEach(element => {
        this.animationObserver?.observe(element);
      });
    }, 1000);
  }

  private monitorBatteryChanges(): void {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryLevel = () => {
          this.capabilities.batteryLevel = battery.level * 100;
          this.applyAnimationOptimizations();
        };

        battery.addEventListener('levelchange', updateBatteryLevel);
        battery.addEventListener('chargingchange', () => {
          // If charging, allow more animations
          if (battery.charging) {
            this.capabilities.batteryLevel = 100;
            this.applyAnimationOptimizations();
          }
        });
      });
    }
  }

  private monitorMemoryPressure(): void {
    // Listen for memory monitor updates
    window.addEventListener('memory-pressure-change', (event: any) => {
      this.capabilities.memoryPressure = event.detail.level;
      this.applyAnimationOptimizations();
    });
  }

  // Public API
  shouldAnimate(element?: HTMLElement): boolean {
    if (this.shouldReduceAnimations()) {
      return false;
    }

    // Check if element is visible
    if (element) {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      return isVisible;
    }

    return true;
  }

  getAnimationConfig(): {
    duration: number;
    easing: string;
    reduced: boolean;
  } {
    if (this.shouldReduceAnimations()) {
      return {
        duration: 0,
        easing: 'linear',
        reduced: true
      };
    }

    return {
      duration: this.capabilities.isLowEnd ? 150 : 300,
      easing: 'ease-out',
      reduced: false
    };
  }

  pauseAnimations(): void {
    document.documentElement.classList.add('animations-paused');
  }

  resumeAnimations(): void {
    document.documentElement.classList.remove('animations-paused');
  }

  // Utility for conditional animation classes
  getAnimationClasses(baseClasses: string, animatedClasses: string): string {
    return this.shouldReduceAnimations() ? baseClasses : `${baseClasses} ${animatedClasses}`;
  }
}

// CSS for reduced animations
const reducedAnimationCSS = `
.reduced-animations *,
.reduced-animations *::before,
.reduced-animations *::after {
  animation-duration: 0.01ms !important;
  animation-delay: 0ms !important;
  transition-duration: 0.01ms !important;
  transition-delay: 0ms !important;
}

.animations-paused *,
.animations-paused *::before,
.animations-paused *::after {
  animation-play-state: paused !important;
}

.animate-in {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = reducedAnimationCSS;
  document.head.appendChild(style);
}

// Export singleton instance
export const animationOptimizer = AnimationOptimizer.getInstance();

// Export types
export type { DeviceCapabilities };