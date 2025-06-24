'use strict';
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) =>
  function __require() {
    return (
      mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports
    );
  };
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod
  )
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// ../../node_modules/dotenv/package.json
var require_package = __commonJS({
  '../../node_modules/dotenv/package.json'(exports2, module2) {
    module2.exports = {
      name: 'dotenv',
      version: '16.5.0',
      description: 'Loads environment variables from .env file',
      main: 'lib/main.js',
      types: 'lib/main.d.ts',
      exports: {
        '.': {
          types: './lib/main.d.ts',
          require: './lib/main.js',
          default: './lib/main.js',
        },
        './config': './config.js',
        './config.js': './config.js',
        './lib/env-options': './lib/env-options.js',
        './lib/env-options.js': './lib/env-options.js',
        './lib/cli-options': './lib/cli-options.js',
        './lib/cli-options.js': './lib/cli-options.js',
        './package.json': './package.json',
      },
      scripts: {
        'dts-check': 'tsc --project tests/types/tsconfig.json',
        lint: 'standard',
        pretest: 'npm run lint && npm run dts-check',
        test: 'tap run --allow-empty-coverage --disable-coverage --timeout=60000',
        'test:coverage': 'tap run --show-full-coverage --timeout=60000 --coverage-report=lcov',
        prerelease: 'npm test',
        release: 'standard-version',
      },
      repository: {
        type: 'git',
        url: 'git://github.com/motdotla/dotenv.git',
      },
      homepage: 'https://github.com/motdotla/dotenv#readme',
      funding: 'https://dotenvx.com',
      keywords: ['dotenv', 'env', '.env', 'environment', 'variables', 'config', 'settings'],
      readmeFilename: 'README.md',
      license: 'BSD-2-Clause',
      devDependencies: {
        '@types/node': '^18.11.3',
        decache: '^4.6.2',
        sinon: '^14.0.1',
        standard: '^17.0.0',
        'standard-version': '^9.5.0',
        tap: '^19.2.0',
        typescript: '^4.8.4',
      },
      engines: {
        node: '>=12',
      },
      browser: {
        fs: false,
      },
    };
  },
});

// ../../node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  '../../node_modules/dotenv/lib/main.js'(exports2, module2) {
    'use strict';
    var fs = require('fs');
    var path = require('path');
    var os = require('os');
    var crypto = require('crypto');
    var packageJson = require_package();
    var version = packageJson.version;
    var LINE =
      /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/gm, '\n');
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || '';
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2');
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, '\n');
          value = value.replace(/\\r/g, '\r');
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      const vaultPath = _vaultPath(options);
      const result = DotenvModule.configDotenv({ path: vaultPath });
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = 'MISSING_DATA';
        throw err;
      }
      const keys = _dotenvKey(options).split(',');
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return '';
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === 'ERR_INVALID_URL') {
          const err = new Error(
            'INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development'
          );
          err.code = 'INVALID_DOTENV_KEY';
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error('INVALID_DOTENV_KEY: Missing key part');
        err.code = 'INVALID_DOTENV_KEY';
        throw err;
      }
      const environment = uri.searchParams.get('environment');
      if (!environment) {
        const err = new Error('INVALID_DOTENV_KEY: Missing environment part');
        err.code = 'INVALID_DOTENV_KEY';
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(
          `NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`
        );
        err.code = 'NOT_FOUND_DOTENV_ENVIRONMENT';
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith('.vault') ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith('.vault')
            ? options.path
            : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), '.env.vault');
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = Boolean(options && options.debug);
      if (debug) {
        _debug('Loading env from encrypted .env.vault');
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path.resolve(process.cwd(), '.env');
      let encoding = 'utf8';
      const debug = Boolean(options && options.debug);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug('No encoding is specified. UTF-8 is used by default');
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path2 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path2} ${e.message}`);
          }
          lastError = e;
        }
      }
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options);
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config2(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(
          `You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`
        );
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), 'hex');
      let ciphertext = Buffer.from(encrypted, 'base64');
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv('aes-256-gcm', key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === 'Invalid key length';
        const decryptionFailed =
          error.message === 'Unsupported state or unable to authenticate data';
        if (isRange || invalidKeyLength) {
          const err = new Error('INVALID_DOTENV_KEY: It must be 64 characters long (or more)');
          err.code = 'INVALID_DOTENV_KEY';
          throw err;
        } else if (decryptionFailed) {
          const err = new Error('DECRYPTION_FAILED: Please check your DOTENV_KEY');
          err.code = 'DECRYPTION_FAILED';
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== 'object') {
        const err = new Error(
          'OBJECT_REQUIRED: Please check the processEnv argument being passed to populate'
        );
        err.code = 'OBJECT_REQUIRED';
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config: config2,
      decrypt,
      parse,
      populate,
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  },
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CustomerService: () => CustomerService,
  InvoiceService: () => InvoiceService,
  PaymentService: () => PaymentService,
  PortalService: () => PortalService,
  STRIPE_WEBHOOK_SECRET: () => STRIPE_WEBHOOK_SECRET,
  SubscriptionService: () => SubscriptionService,
  WebhookService: () => WebhookService,
  stripe: () => stripe,
});
module.exports = __toCommonJS(index_exports);

// src/stripe-client.ts
var import_stripe = __toESM(require('stripe'));
var dotenv = __toESM(require_main());
dotenv.config({ path: '../../../.env' });
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    'STRIPE_SECRET_KEY is not set in environment variables. Using dummy key for development.'
  );
}
var stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16',
  typescript: true,
});
var STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// src/customer.service.ts
var CustomerService = class {
  /**
   * Create a new Stripe customer for an organization
   */
  async createCustomer(params) {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        organizationId: params.organizationId,
        ...params.metadata,
      },
    });
    return customer;
  }
  /**
   * Retrieve a customer by Stripe customer ID
   */
  async getCustomer(customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        return null;
      }
      return customer;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return null;
    }
  }
  /**
   * Update customer details
   */
  async updateCustomer(customerId, params) {
    const customer = await stripe.customers.update(customerId, params);
    return customer;
  }
  /**
   * Delete a customer (soft delete in Stripe)
   */
  async deleteCustomer(customerId) {
    const deleted = await stripe.customers.del(customerId);
    return deleted;
  }
  /**
   * List all payment methods for a customer
   */
  async listPaymentMethods(customerId, type = 'card') {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type,
    });
    return paymentMethods.data;
  }
  /**
   * Get the default payment method for a customer
   */
  async getDefaultPaymentMethod(customerId) {
    const customer = await this.getCustomer(customerId);
    if (!customer || !customer.invoice_settings.default_payment_method) {
      return null;
    }
    const paymentMethodId = customer.invoice_settings.default_payment_method;
    if (typeof paymentMethodId === 'string') {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      return paymentMethod;
    }
    return null;
  }
  /**
   * Set default payment method for a customer
   */
  async setDefaultPaymentMethod(customerId, paymentMethodId) {
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    return customer;
  }
  /**
   * Attach a payment method to a customer
   */
  async attachPaymentMethod(customerId, paymentMethodId) {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    return paymentMethod;
  }
  /**
   * Detach a payment method from a customer
   */
  async detachPaymentMethod(paymentMethodId) {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return paymentMethod;
  }
};

// src/subscription.service.ts
var SubscriptionService = class {
  /**
   * Create a new subscription for a customer
   */
  async createSubscription(params) {
    const subscription = await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: params.trialDays,
      metadata: params.metadata,
    });
    return subscription;
  }
  /**
   * Retrieve a subscription
   */
  async getSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return null;
    }
  }
  /**
   * Update a subscription (change plan)
   */
  async updateSubscription(subscriptionId, params) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updateParams = {
      metadata: params.metadata,
      proration_behavior: params.prorationBehavior || 'create_prorations',
    };
    if (params.priceId && subscription.items.data.length > 0) {
      updateParams.items = [
        {
          id: subscription.items.data[0].id,
          price: params.priceId,
          quantity: params.quantity,
        },
      ];
    }
    const updated = await stripe.subscriptions.update(subscriptionId, updateParams);
    return updated;
  }
  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId, params = {}) {
    if (params.cancelAtPeriodEnd) {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
        cancellation_details: {
          comment: params.cancellationReason,
        },
      });
      return subscription;
    } else {
      const subscription = await stripe.subscriptions.cancel(subscriptionId, {
        cancellation_details: {
          comment: params.cancellationReason,
        },
      });
      return subscription;
    }
  }
  /**
   * Reactivate a canceled subscription (if still in period)
   */
  async reactivateSubscription(subscriptionId) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return subscription;
  }
  /**
   * Pause a subscription
   */
  async pauseSubscription(subscriptionId, params) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: params.behavior,
        resumes_at: params.resumes_at,
      },
    });
    return subscription;
  }
  /**
   * Resume a paused subscription
   */
  async resumeSubscription(subscriptionId) {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      pause_collection: null,
    });
    return subscription;
  }
  /**
   * List all subscriptions for a customer
   */
  async listSubscriptions(customerId, params = {}) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: params.status,
      limit: params.limit || 10,
    });
    return subscriptions.data;
  }
  /**
   * Get the active subscription for a customer
   */
  async getActiveSubscription(customerId) {
    const subscriptions = await this.listSubscriptions(customerId, { status: 'active' });
    return subscriptions.length > 0 ? subscriptions[0] : null;
  }
  /**
   * Create a subscription schedule for future changes
   */
  async createSubscriptionSchedule(params) {
    const phases = params.phases.map((phase, index) => ({
      items: [{ price: phase.priceId, quantity: phase.quantity || 1 }],
      iterations: phase.duration || 1,
      trial: phase.trial || false,
    }));
    const schedule = await stripe.subscriptionSchedules.create({
      customer: params.customerId,
      start_date: params.startDate || 'now',
      phases,
    });
    return schedule;
  }
  /**
   * Preview proration for a subscription change
   */
  async previewProration(subscriptionId, params) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const items = [
      {
        id: subscription.items.data[0].id,
        price: params.priceId,
        quantity: params.quantity || 1,
      },
    ];
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: subscription.customer,
      subscription: subscriptionId,
      subscription_items: items,
      subscription_proration_behavior: 'create_prorations',
    });
    return invoice;
  }
};

// src/payment.service.ts
var PaymentService = class {
  /**
   * Create a checkout session for new subscriptions
   */
  async createCheckoutSession(params) {
    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
      subscription_data: {
        trial_period_days: params.trialDays,
      },
    };
    if (params.customerId) {
      sessionParams.customer = params.customerId;
    } else if (params.customerEmail) {
      sessionParams.customer_email = params.customerEmail;
    }
    const session = await stripe.checkout.sessions.create(sessionParams);
    return session;
  }
  /**
   * Create a setup intent for adding payment methods
   */
  async createSetupIntent(params) {
    const setupIntent = await stripe.setupIntents.create({
      customer: params.customerId,
      payment_method_types: ['card'],
      metadata: params.metadata,
    });
    return setupIntent;
  }
  /**
   * Create a payment intent for one-time payments
   */
  async createPaymentIntent(params) {
    const paymentIntent = await stripe.paymentIntents.create({
      customer: params.customerId,
      amount: params.amount,
      currency: params.currency || 'usd',
      payment_method: params.paymentMethodId,
      confirm: params.confirm,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: params.metadata,
    });
    return paymentIntent;
  }
  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(paymentIntentId, params) {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: params.paymentMethodId,
      return_url: params.returnUrl,
    });
    return paymentIntent;
  }
  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      return null;
    }
  }
  /**
   * Create a refund
   */
  async createRefund(params) {
    const refundParams = {
      amount: params.amount,
      reason: params.reason,
      metadata: params.metadata,
    };
    if (params.paymentIntentId) {
      refundParams.payment_intent = params.paymentIntentId;
    } else if (params.chargeId) {
      refundParams.charge = params.chargeId;
    }
    const refund = await stripe.refunds.create(refundParams);
    return refund;
  }
  /**
   * List charges for a customer
   */
  async listCharges(customerId, params = {}) {
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: params.limit || 10,
      starting_after: params.starting_after,
    });
    return charges.data;
  }
  /**
   * Retrieve a charge
   */
  async getCharge(chargeId) {
    try {
      const charge = await stripe.charges.retrieve(chargeId);
      return charge;
    } catch (error) {
      console.error('Error retrieving charge:', error);
      return null;
    }
  }
};

// src/invoice.service.ts
var InvoiceService = class {
  /**
   * Retrieve an invoice
   */
  async getInvoice(invoiceId) {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      return invoice;
    } catch (error) {
      console.error('Error retrieving invoice:', error);
      return null;
    }
  }
  /**
   * List invoices for a customer
   */
  async listInvoices(customerId, params = {}) {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      status: params.status,
      limit: params.limit || 10,
      starting_after: params.starting_after,
    });
    return invoices.data;
  }
  /**
   * Create a manual invoice
   */
  async createInvoice(params) {
    const invoice = await stripe.invoices.create({
      customer: params.customerId,
      description: params.description,
      metadata: params.metadata,
      auto_advance: params.auto_advance ?? true,
    });
    return invoice;
  }
  /**
   * Add line items to an invoice
   */
  async addInvoiceItem(params) {
    const item = await stripe.invoiceItems.create({
      customer: params.customerId,
      invoice: params.invoiceId,
      amount: params.amount,
      currency: params.currency || 'usd',
      description: params.description,
      metadata: params.metadata,
    });
    return item;
  }
  /**
   * Finalize an invoice (make it ready for payment)
   */
  async finalizeInvoice(invoiceId, params = {}) {
    const invoice = await stripe.invoices.finalizeInvoice(invoiceId, {
      auto_advance: params.auto_advance ?? true,
    });
    return invoice;
  }
  /**
   * Send an invoice to the customer
   */
  async sendInvoice(invoiceId) {
    const invoice = await stripe.invoices.sendInvoice(invoiceId);
    return invoice;
  }
  /**
   * Pay an invoice manually
   */
  async payInvoice(invoiceId, params = {}) {
    const invoice = await stripe.invoices.pay(invoiceId, {
      payment_method: params.paymentMethodId,
      source: params.source,
    });
    return invoice;
  }
  /**
   * Void an invoice
   */
  async voidInvoice(invoiceId) {
    const invoice = await stripe.invoices.voidInvoice(invoiceId);
    return invoice;
  }
  /**
   * Mark an invoice as uncollectible
   */
  async markUncollectible(invoiceId) {
    const invoice = await stripe.invoices.markUncollectible(invoiceId);
    return invoice;
  }
  /**
   * Retrieve upcoming invoice (preview next invoice)
   */
  async getUpcomingInvoice(customerId, params = {}) {
    try {
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: customerId,
        subscription: params.subscriptionId,
      });
      return invoice;
    } catch (error) {
      console.error('Error retrieving upcoming invoice:', error);
      return null;
    }
  }
  /**
   * Download invoice PDF
   */
  async getInvoicePdfUrl(invoiceId) {
    const invoice = await this.getInvoice(invoiceId);
    return invoice?.invoice_pdf || null;
  }
};

// src/portal.service.ts
var PortalService = class {
  /**
   * Create a customer portal session
   */
  async createPortalSession(params) {
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
    return session;
  }
  /**
   * Configure the customer portal settings
   */
  async configurePortal(params) {
    const configuration = await stripe.billingPortal.configurations.create({
      business_profile: params.businessProfile,
      features: params.features || {
        customer_update: {
          enabled: true,
          allowed_updates: ['email', 'address', 'phone', 'name'],
        },
        invoice_history: {
          enabled: true,
        },
        payment_method_update: {
          enabled: true,
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'customer_service',
              'too_complex',
              'low_quality',
              'other',
            ],
          },
        },
        subscription_pause: {
          enabled: false,
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price'],
          proration_behavior: 'create_prorations',
          products: [],
        },
      },
    });
    return configuration;
  }
  /**
   * Update portal configuration
   */
  async updatePortalConfiguration(configurationId, params) {
    const configuration = await stripe.billingPortal.configurations.update(configurationId, params);
    return configuration;
  }
  /**
   * List portal configurations
   */
  async listPortalConfigurations(params = {}) {
    const configurations = await stripe.billingPortal.configurations.list({
      limit: params.limit || 10,
      active: params.active,
    });
    return configurations.data;
  }
};

// src/webhook.service.ts
var WebhookService = class {
  /**
   * Verify webhook signature and construct event
   */
  async constructEvent(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }
  /**
   * Handle customer.created event
   */
  async handleCustomerCreated(customer) {
    console.log('Customer created:', customer.id);
  }
  /**
   * Handle customer.subscription.created event
   */
  async handleSubscriptionCreated(subscription) {
    console.log('Subscription created:', subscription.id);
  }
  /**
   * Handle customer.subscription.updated event
   */
  async handleSubscriptionUpdated(subscription) {
    console.log('Subscription updated:', subscription.id);
  }
  /**
   * Handle customer.subscription.deleted event
   */
  async handleSubscriptionDeleted(subscription) {
    console.log('Subscription deleted:', subscription.id);
  }
  /**
   * Handle invoice.paid event
   */
  async handleInvoicePaid(invoice) {
    console.log('Invoice paid:', invoice.id);
  }
  /**
   * Handle invoice.payment_failed event
   */
  async handleInvoicePaymentFailed(invoice) {
    console.log('Invoice payment failed:', invoice.id);
  }
  /**
   * Handle payment_intent.succeeded event
   */
  async handlePaymentIntentSucceeded(paymentIntent) {
    console.log('Payment intent succeeded:', paymentIntent.id);
  }
  /**
   * Handle payment_method.attached event
   */
  async handlePaymentMethodAttached(paymentMethod) {
    console.log('Payment method attached:', paymentMethod.id);
  }
  /**
   * Main webhook handler
   */
  async handleWebhook(event) {
    switch (event.type) {
      case 'customer.created':
        await this.handleCustomerCreated(event.data.object);
        break;
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_method.attached':
        await this.handlePaymentMethodAttached(event.data.object);
        break;
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    CustomerService,
    InvoiceService,
    PaymentService,
    PortalService,
    STRIPE_WEBHOOK_SECRET,
    SubscriptionService,
    WebhookService,
    stripe,
  });
//# sourceMappingURL=index.js.map
