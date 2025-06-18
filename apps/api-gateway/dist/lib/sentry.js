'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.initSentry = initSentry;
exports.captureException = captureException;
exports.captureMessage = captureMessage;
exports.setUser = setUser;
exports.clearUser = clearUser;
exports.addBreadcrumb = addBreadcrumb;
exports.withSentry = withSentry;
const Sentry = __importStar(require('@sentry/node'));
const profiling_node_1 = require('@sentry/profiling-node');
function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
    integrations: [
      // Automatically instrument Node.js libraries and frameworks
      ...Sentry.getDefaultIntegrations({}),
      (0, profiling_node_1.nodeProfilingIntegration)(),
    ],
    // Set transaction name source
    beforeSend(event, _hint) {
      // Sanitize any sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    },
    // Configure error filtering
    ignoreErrors: [
      // Ignore common browser errors
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Ignore specific HTTP status codes
      /^4\d{2}$/,
    ],
  });
}
function captureException(error, context) {
  Sentry.captureException(error, {
    extra: context,
  });
}
function captureMessage(message, level = 'info') {
  Sentry.captureMessage(message, level);
}
function setUser(user) {
  Sentry.setUser(user);
}
function clearUser() {
  Sentry.setUser(null);
}
function addBreadcrumb(breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}
function withSentry(fn, options) {
  return (...args) => {
    return Sentry.startSpan(
      {
        name: options?.name || fn.name || 'anonymous',
        op: options?.op || 'function',
      },
      () => fn(...args)
    );
  };
}
