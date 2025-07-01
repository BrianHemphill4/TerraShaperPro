"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRenderJob = processRenderJob;
const RenderCoordinator_1 = require("../services/RenderCoordinator");
const renderCoordinator = new RenderCoordinator_1.RenderCoordinator();
async function processRenderJob(job) {
    return renderCoordinator.processRenderJob(job);
}
