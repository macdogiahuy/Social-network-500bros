import { Application } from 'express';
import helmet from 'helmet';

/**
 * Applies various security enhancements to the Express application
 * @param app Express application
 */
export const applySecurityMiddleware = (app: Application): void => {
  // Set security HTTP headers with recommended defaults
  app.use(helmet());

  // Set more specific CSP rules
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    })
  );

  // Set strict transport security for HTTPS
  app.use(
    helmet.hsts({
      maxAge: 15552000, // 180 days in seconds
      includeSubDomains: true
    })
  );

  // Prevent clickjacking
  app.use(helmet.frameguard({ action: 'deny' }));

  // Hide X-Powered-By header
  app.use(helmet.hidePoweredBy());

  // Prevent MIME type sniffing
  app.use(helmet.noSniff());

  // Add XSS protection headers
  app.use(helmet.xssFilter());

  // Enable DNS prefetch control
  app.use(helmet.dnsPrefetchControl());

  // Set referrer policy
  app.use(
    helmet.referrerPolicy({
      policy: 'same-origin'
    })
  );

  // Implement simple XSS prevention with sanitization middleware
  app.use((req, res, next) => {
    if (req.body) {
      // Function to recursively sanitize an object
      const sanitize = (obj: any): any => {
        if (!obj) return obj;

        if (typeof obj === 'string') {
          // Simple XSS prevention by replacing script tags
          return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }

        if (typeof obj === 'object') {
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              obj[key] = sanitize(obj[key]);
            }
          }
        }

        return obj;
      };

      req.body = sanitize(req.body);
    }

    next();
  });

  // Simple HTTP Parameter Pollution prevention
  app.use((req, res, next) => {
    if (req.query) {
      for (const key in req.query) {
        if (Array.isArray(req.query[key])) {
          // Take the first value when parameter is duplicated
          req.query[key] = req.query[key][0];
        }
      }
    }
    next();
  });
};
