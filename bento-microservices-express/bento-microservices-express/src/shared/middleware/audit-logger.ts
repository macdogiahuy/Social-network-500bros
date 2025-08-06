import Logger from '@shared/utils/logger';
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware to log security-relevant actions
 * @param options Configuration options
 */
export const securityAuditMiddleware = (options: {
  // List of sensitive endpoints that should be audited
  sensitiveEndpoints?: string[];
  // Whether to log request body (could contain sensitive data)
  logRequestBody?: boolean;
}) => {
  const { sensitiveEndpoints = [], logRequestBody = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Store original send function instead of end (more reliable)
    const originalSend = res.send;
    const startTime = Date.now();

    // Check if the current endpoint is in the sensitive list
    const isSensitive = sensitiveEndpoints.some((endpoint) => req.path.includes(endpoint));

    // Information to log
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const method = req.method;
    const path = req.path;
    const userAgent = req.headers['user-agent'];
    const userId = (req as any).user?.id || 'unauthenticated';

    // Create an object to store log data
    const logData: Record<string, any> = {
      timestamp: new Date().toISOString(),
      ip,
      userId,
      method,
      path,
      userAgent,
      isSensitive
    };

    // Log request body if enabled and not a GET request (which doesn't have a body)
    if (logRequestBody && method !== 'GET') {
      // Be careful not to log sensitive information like passwords
      const safeBody = { ...req.body };

      // Remove sensitive fields
      if (safeBody.password) safeBody.password = '[REDACTED]';
      if (safeBody.token) safeBody.token = '[REDACTED]';
      if (safeBody.accessToken) safeBody.accessToken = '[REDACTED]';
      if (safeBody.refreshToken) safeBody.refreshToken = '[REDACTED]';

      logData.requestBody = safeBody;
    }

    // Override send function to capture response
    res.send = function (body): Response {
      // Calculate request duration
      const duration = Date.now() - startTime;
      logData.duration = `${duration}ms`;
      logData.statusCode = res.statusCode;

      // Log the request
      if (isSensitive || res.statusCode >= 400) {
        // For sensitive endpoints or errors, use warning level
        Logger.warning(`Security audit: ${JSON.stringify(logData)}`);
      } else {
        // For regular requests, use info level
        Logger.info(`Request: ${method} ${path} - ${res.statusCode} (${duration}ms)`);
      }

      // Call the original send function and return its result
      return originalSend.call(res, body);
    };

    next();
  };
};

// Export a pre-configured middleware for sensitive operations
export const sensitiveOperationsAudit = securityAuditMiddleware({
  sensitiveEndpoints: ['/authenticate', '/register', '/reset-password', '/forgot-password', '/profile', '/users'],
  logRequestBody: false // Set to true only if you want to log request bodies (careful with privacy)
});
