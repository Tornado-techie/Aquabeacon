/**
 * Performance Monitoring Service
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0
    };
  }

  /**
   * Express middleware for performance monitoring
   */
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Increment request count
      this.metrics.requestCount++;

      // Log response time after request completes
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.metrics.totalResponseTime += duration;
        
        // Log slow requests (> 1 second)
        if (duration > 1000) {
          console.log(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
        }

        // Track errors
        if (res.statusCode >= 400) {
          this.metrics.errorCount++;
        }
      });

      next();
    };
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const avgResponseTime = this.metrics.requestCount > 0 
      ? this.metrics.totalResponseTime / this.metrics.requestCount 
      : 0;

    return {
      requestCount: this.metrics.requestCount,
      errorCount: this.metrics.errorCount,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: this.metrics.requestCount > 0 
        ? (this.metrics.errorCount / this.metrics.requestCount * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0
    };
  }
}

module.exports = new PerformanceMonitor();
