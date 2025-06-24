"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const zod_1 = require("zod");
const billing_router_1 = require("./routers/billing.router");
const client_portal_router_1 = require("./routers/client-portal.router");
const credit_router_1 = require("./routers/credit.router");
const export_router_1 = require("./routers/export.router");
const mask_router_1 = require("./routers/mask.router");
const plant_router_1 = require("./routers/plant.router");
const project_router_1 = require("./routers/project.router");
const render_router_1 = require("./routers/render.router");
const scene_router_1 = require("./routers/scene.router");
const storage_router_1 = require("./routers/storage.router");
const team_router_1 = require("./routers/team.router");
const trpc_1 = require("./trpc");
const healthRouter = (0, trpc_1.router)({
    healthz: trpc_1.publicProcedure.query(() => 'yay!'),
});
exports.appRouter = (0, trpc_1.router)({
    health: healthRouter,
    render: render_router_1.renderRouter,
    storage: storage_router_1.storageRouter,
    credit: credit_router_1.creditRouter,
    plant: plant_router_1.plantRouter,
    project: project_router_1.projectRouter,
    scene: scene_router_1.sceneRouter,
    mask: mask_router_1.maskRouter,
    export: export_router_1.exportRouter,
    team: team_router_1.teamRouter,
    clientPortal: client_portal_router_1.clientPortalRouter,
    billing: billing_router_1.billingRouter,
    hello: trpc_1.publicProcedure
        .input(zod_1.z.object({
        name: zod_1.z.string(),
    }))
        .query(({ input }) => {
        return {
            text: `hello ${input.name}`,
        };
    }),
});
