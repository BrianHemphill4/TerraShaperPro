#!/usr/bin/env tsx

import * as Sentry from '@sentry/node';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const SENTRY_API_URL = 'https://sentry.io/api/0';
const CONFIG_PATH = path.join(process.cwd(), '.sentryrc.json');

interface SentryConfig {
  org: string;
  project: string;
  alerts: any[];
  performanceAlerts: any[];
  issueAlerts: any[];
}

async function setupSentryAlerts() {
  const token = process.env.SENTRY_AUTH_TOKEN;
  if (!token) {
    console.error('SENTRY_AUTH_TOKEN environment variable is required');
    process.exit(1);
  }

  const config: SentryConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  console.log(`Setting up Sentry alerts for ${config.org}/${config.project}...`);

  // Create Issue Alert Rules
  for (const alert of config.issueAlerts) {
    try {
      const response = await axios.post(
        `${SENTRY_API_URL}/projects/${config.org}/${config.project}/rules/`,
        {
          name: alert.name,
          conditions: alert.conditions,
          filters: alert.filters || [],
          actions: alert.actions,
          frequency: alert.frequency || 30,
          environment: process.env.NODE_ENV || 'production',
        },
        { headers }
      );
      console.log(`✅ Created issue alert: ${alert.name}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log(`⚠️  Issue alert already exists: ${alert.name}`);
      } else {
        console.error(`❌ Failed to create issue alert ${alert.name}:`, error.response?.data || error.message);
      }
    }
  }

  // Create Metric Alert Rules
  for (const alert of config.performanceAlerts) {
    try {
      const response = await axios.post(
        `${SENTRY_API_URL}/organizations/${config.org}/alert-rules/`,
        {
          name: alert.name,
          dataset: alert.dataset,
          query: alert.query,
          aggregate: alert.aggregate,
          timeWindow: alert.timeWindow,
          triggers: alert.triggers,
          projects: [config.project],
          environment: process.env.NODE_ENV || 'production',
        },
        { headers }
      );
      console.log(`✅ Created performance alert: ${alert.name}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log(`⚠️  Performance alert already exists: ${alert.name}`);
      } else {
        console.error(`❌ Failed to create performance alert ${alert.name}:`, error.response?.data || error.message);
      }
    }
  }

  // Configure Slack integration if available
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await axios.post(
        `${SENTRY_API_URL}/organizations/${config.org}/integrations/`,
        {
          provider: 'slack',
          name: 'TerraShaperPro Alerts',
          config: {
            webhook: process.env.SLACK_WEBHOOK_URL,
          },
        },
        { headers }
      );
      console.log('✅ Configured Slack integration');
    } catch (error: any) {
      console.log('⚠️  Slack integration may already be configured');
    }
  }

  console.log('\n🎉 Sentry alerts setup completed!');
  
  // Initialize performance budgets in Sentry
  console.log('\nConfiguring performance budgets...');
  
  const performanceBudgets = [
    { name: 'page.load', threshold: 3000, unit: 'millisecond' },
    { name: 'api.response', threshold: 200, unit: 'millisecond' },
    { name: 'render.generate', threshold: 60000, unit: 'millisecond' },
    { name: 'canvas.render', threshold: 16, unit: 'millisecond' },
  ];

  for (const budget of performanceBudgets) {
    try {
      await axios.post(
        `${SENTRY_API_URL}/organizations/${config.org}/monitors/`,
        {
          name: `Performance Budget: ${budget.name}`,
          type: 'threshold',
          config: {
            threshold: budget.threshold,
            metric: budget.name,
            unit: budget.unit,
          },
          projects: [config.project],
        },
        { headers }
      );
      console.log(`✅ Created performance budget monitor: ${budget.name}`);
    } catch (error: any) {
      console.log(`⚠️  Performance budget monitor may already exist: ${budget.name}`);
    }
  }
}

// Run the setup
setupSentryAlerts().catch(console.error);