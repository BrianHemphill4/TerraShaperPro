"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
exports.connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
};
