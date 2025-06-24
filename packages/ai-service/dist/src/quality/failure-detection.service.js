var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Sentry from '@sentry/node';
import { createWorkerClient } from '@terrashaper/db';
export class FailureDetectionService {
    constructor() {
        this.supabase = createWorkerClient();
        this.alertCallbacks = [];
        // Define failure patterns to monitor
        this.patterns = new Map([
            [
                'high_failure_rate',
                {
                    type: 'quality',
                    count: 5,
                    timeframe: 10,
                    threshold: 0.5, // 50% failure rate
                },
            ],
            [
                'repeated_timeouts',
                {
                    type: 'timeout',
                    count: 3,
                    timeframe: 5,
                    threshold: 1,
                },
            ],
            [
                'api_errors',
                {
                    type: 'api_error',
                    count: 10,
                    timeframe: 15,
                    threshold: 1,
                },
            ],
            [
                'quality_degradation',
                {
                    type: 'quality',
                    count: 10,
                    timeframe: 30,
                    threshold: 0.6, // avg quality score below 0.6
                },
            ],
        ]);
    }
    checkForFailurePatterns() {
        return __awaiter(this, void 0, void 0, function* () {
            const alerts = [];
            for (const [patternName, pattern] of this.patterns) {
                const alert = yield this.checkPattern(patternName, pattern);
                if (alert) {
                    alerts.push(alert);
                    yield this.createAlert(alert);
                }
            }
            return alerts;
        });
    }
    checkPattern(patternName, pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            const since = new Date();
            since.setMinutes(since.getMinutes() - pattern.timeframe);
            const { data: renders } = yield this.supabase
                .from('renders')
                .select('*')
                .gte('createdAt', since.toISOString())
                .order('createdAt', { ascending: false });
            if (!renders || renders.length === 0) {
                return null;
            }
            switch (pattern.type) {
                case 'quality': {
                    const qualityIssues = renders.filter((r) => { var _a; return r.status === 'failed' && ((_a = r.error) === null || _a === void 0 ? void 0 : _a.includes('Quality')); });
                    if (patternName === 'high_failure_rate') {
                        const failureRate = qualityIssues.length / renders.length;
                        if (failureRate >= pattern.threshold && qualityIssues.length >= pattern.count) {
                            return {
                                id: crypto.randomUUID(),
                                type: 'high_failure_rate',
                                severity: 'high',
                                message: `High quality failure rate detected: ${(failureRate * 100).toFixed(1)}% in last ${pattern.timeframe} minutes`,
                                details: {
                                    failureRate,
                                    totalRenders: renders.length,
                                    failedRenders: qualityIssues.length,
                                    pattern: patternName,
                                },
                                createdAt: new Date(),
                                acknowledged: false,
                            };
                        }
                    }
                    else if (patternName === 'quality_degradation') {
                        const avgScore = renders
                            .filter((r) => { var _a; return (_a = r.metadata) === null || _a === void 0 ? void 0 : _a.quality; })
                            .reduce((sum, r) => sum + (r.metadata.quality || 0), 0) / renders.length;
                        if (avgScore < pattern.threshold && renders.length >= pattern.count) {
                            return {
                                id: crypto.randomUUID(),
                                type: 'quality_degradation',
                                severity: 'medium',
                                message: `Average quality score dropped to ${avgScore.toFixed(2)} in last ${pattern.timeframe} minutes`,
                                details: {
                                    avgScore,
                                    threshold: pattern.threshold,
                                    sampleSize: renders.length,
                                    pattern: patternName,
                                },
                                createdAt: new Date(),
                                acknowledged: false,
                            };
                        }
                    }
                    break;
                }
                case 'timeout': {
                    const timeouts = renders.filter((r) => { var _a; return r.status === 'failed' && ((_a = r.error) === null || _a === void 0 ? void 0 : _a.includes('timeout')); });
                    if (timeouts.length >= pattern.count) {
                        return {
                            id: crypto.randomUUID(),
                            type: 'repeated_timeouts',
                            severity: 'high',
                            message: `${timeouts.length} render timeouts in last ${pattern.timeframe} minutes`,
                            details: {
                                timeoutCount: timeouts.length,
                                affectedRenders: timeouts.map((r) => r.id),
                                pattern: patternName,
                            },
                            createdAt: new Date(),
                            acknowledged: false,
                        };
                    }
                    break;
                }
                case 'api_error': {
                    const apiErrors = renders.filter((r) => {
                        var _a, _b, _c;
                        return r.status === 'failed' &&
                            (((_a = r.error) === null || _a === void 0 ? void 0 : _a.includes('API')) ||
                                ((_b = r.error) === null || _b === void 0 ? void 0 : _b.includes('provider')) ||
                                ((_c = r.error) === null || _c === void 0 ? void 0 : _c.includes('rate limit')));
                    });
                    if (apiErrors.length >= pattern.count) {
                        const errorTypes = this.categorizeApiErrors(apiErrors);
                        return {
                            id: crypto.randomUUID(),
                            type: 'api_errors',
                            severity: 'critical',
                            message: `${apiErrors.length} API errors in last ${pattern.timeframe} minutes`,
                            details: {
                                errorCount: apiErrors.length,
                                errorTypes,
                                affectedProviders: [...new Set(apiErrors.map((r) => { var _a; return (_a = r.settings) === null || _a === void 0 ? void 0 : _a.provider; }))],
                                pattern: patternName,
                            },
                            createdAt: new Date(),
                            acknowledged: false,
                        };
                    }
                    break;
                }
            }
            return null;
        });
    }
    categorizeApiErrors(renders) {
        const categories = {};
        renders.forEach((render) => {
            const error = render.error || '';
            if (error.includes('rate limit')) {
                categories.rate_limit = (categories.rate_limit || 0) + 1;
            }
            else if (error.includes('authentication')) {
                categories.auth_error = (categories.auth_error || 0) + 1;
            }
            else if (error.includes('quota')) {
                categories.quota_exceeded = (categories.quota_exceeded || 0) + 1;
            }
            else {
                categories.unknown = (categories.unknown || 0) + 1;
            }
        });
        return categories;
    }
    createAlert(alert) {
        return __awaiter(this, void 0, void 0, function* () {
            // Store alert in database
            const { error } = yield this.supabase.from('failure_alerts').insert(alert);
            if (error) {
                console.error('Failed to create alert:', error);
            }
            // Send to Sentry
            Sentry.captureMessage(alert.message, {
                level: this.mapSeverityToSentryLevel(alert.severity),
                tags: {
                    alertType: alert.type,
                    severity: alert.severity,
                },
                extra: alert.details,
            });
            // Trigger callbacks (for real-time notifications)
            this.alertCallbacks.forEach((callback) => {
                try {
                    callback(alert);
                }
                catch (err) {
                    console.error('Alert callback error:', err);
                }
            });
        });
    }
    mapSeverityToSentryLevel(severity) {
        switch (severity) {
            case 'low':
                return 'info';
            case 'medium':
                return 'warning';
            case 'high':
                return 'error';
            case 'critical':
                return 'fatal';
        }
    }
    onAlert(callback) {
        this.alertCallbacks.push(callback);
    }
    acknowledgeAlert(alertId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error } = yield this.supabase
                .from('failure_alerts')
                .update({
                acknowledged: true,
                acknowledgedBy: userId,
                acknowledgedAt: new Date().toISOString(),
            })
                .eq('id', alertId);
            if (error) {
                throw new Error(`Failed to acknowledge alert: ${error.message}`);
            }
        });
    }
    getActiveAlerts() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, error } = yield this.supabase
                .from('failure_alerts')
                .select('*')
                .eq('acknowledged', false)
                .order('createdAt', { ascending: false });
            if (error) {
                throw new Error(`Failed to fetch active alerts: ${error.message}`);
            }
            return data;
        });
    }
    getAlertHistory() {
        return __awaiter(this, arguments, void 0, function* (days = 7) {
            const since = new Date();
            since.setDate(since.getDate() - days);
            const { data, error } = yield this.supabase
                .from('failure_alerts')
                .select('*')
                .gte('createdAt', since.toISOString())
                .order('createdAt', { ascending: false });
            if (error) {
                throw new Error(`Failed to fetch alert history: ${error.message}`);
            }
            return data;
        });
    }
    // Health check method to verify service connectivity
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hourAgo = new Date();
                hourAgo.setHours(hourAgo.getHours() - 1);
                const { data: recentRenders } = yield this.supabase
                    .from('renders')
                    .select('status')
                    .gte('createdAt', hourAgo.toISOString());
                const failureRate = recentRenders
                    ? recentRenders.filter((r) => r.status === 'failed').length / recentRenders.length
                    : 0;
                const activeAlerts = yield this.getActiveAlerts();
                return {
                    healthy: failureRate < 0.1 && activeAlerts.length === 0,
                    recentFailureRate: failureRate,
                    activeAlerts: activeAlerts.length,
                };
            }
            catch (_a) {
                return {
                    healthy: false,
                    recentFailureRate: 1,
                    activeAlerts: -1,
                };
            }
        });
    }
}
