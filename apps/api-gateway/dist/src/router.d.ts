import { z } from 'zod';
export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("./context").Session;
        supabase: import("./context").SupabaseClient;
    };
    meta: object;
    errorShape: {
        data: {
            zodError: z.typeToFlattenedError<any, string> | null;
            code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
            httpStatus: number;
            path?: string;
            stack?: string;
        };
        message: string;
        code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
    };
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    health: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        healthz: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: string;
            meta: object;
        }>;
    }>>;
    render: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId: string;
                sceneId: string;
                sourceImageUrl: string;
                prompt: {
                    user: string;
                    system: string;
                };
                annotations: {
                    type: "mask" | "assetInstance" | "textLabel";
                    data?: any;
                }[];
                settings: {
                    resolution: "1024x1024" | "2048x2048" | "4096x4096";
                    provider: "google-imagen" | "openai-gpt-image";
                    format?: "PNG" | "JPEG" | undefined;
                    quality?: number | undefined;
                };
                maskImageUrl?: string | undefined;
            };
            output: {
                renderId: string;
                jobId: string | undefined;
                status: string;
            };
            meta: object;
        }>;
        status: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                renderId: string;
            };
            output: {
                renderId: any;
                status: any;
                progress: any;
                imageUrl: any;
                thumbnailUrl: any;
                error: any;
                metadata: any;
            };
            meta: object;
        }>;
        subscribe: import("@trpc/server/dist/unstable-core-do-not-import.d-CSxj_rbP.cjs").LegacyObservableSubscriptionProcedure<{
            input: {
                renderId: string;
            };
            output: {
                type: "progress" | "completed" | "failed" | "ping";
                progress?: number;
                result?: any;
                error?: string;
            };
            meta: object;
        }>;
        metrics: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                waiting: number;
                active: number;
                completed: number;
                failed: number;
                delayed: number;
                paused: number;
                total: number;
            };
            meta: object;
        }>;
        retry: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                renderId: string;
            };
            output: {
                renderId: string;
                jobId: string | undefined;
                status: string;
            };
            meta: object;
        }>;
    }>>;
    storage: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        generateUploadUrl: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                fileName: string;
                contentType: string;
                bucketType: "renders" | "assets";
                expiresInMinutes?: number | undefined;
            };
            output: {
                uploadUrl: string;
                fileName: string;
                publicUrl: string;
                expiresAt: Date;
            };
            meta: object;
        }>;
        generateDownloadUrl: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                fileName: string;
                bucketType: "renders" | "assets";
                expiresInMinutes?: number | undefined;
            };
            output: {
                downloadUrl: string;
                fileName: string;
                expiresAt: Date;
            };
            meta: object;
        }>;
        fileExists: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                fileName: string;
                bucketType: "renders" | "assets";
            };
            output: {
                exists: boolean;
                fileName: string;
            };
            meta: object;
        }>;
        getFileMetadata: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                fileName: string;
                bucketType: "renders" | "assets";
            };
            output: {
                fileName: string;
                size: string | number | undefined;
                contentType: string | undefined;
                created: string | undefined;
                updated: string | undefined;
                etag: string | undefined;
            };
            meta: object;
        }>;
        deleteFile: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                fileName: string;
                bucketType: "renders" | "assets";
            };
            output: {
                success: boolean;
                fileName: string;
            };
            meta: object;
        }>;
        generateFileName: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                type: "render" | "upload" | "asset";
                id?: string | undefined;
                originalFileName?: string | undefined;
            };
            output: {
                fileName: string;
            };
            meta: object;
        }>;
        getCorsConfig: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                origin: string[];
                methods: string[];
                allowedHeaders: string[];
                maxAgeSeconds: number;
            };
            meta: object;
        }>;
    }>>;
    credit: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        balance: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                balance: any;
            };
            meta: object;
        }>;
        transactions: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number | undefined;
                offset?: number | undefined;
            };
            output: {
                transactions: any;
                total: any;
                hasMore: boolean;
            };
            meta: object;
        }>;
        usage: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                period?: "day" | "week" | "month" | "year" | undefined;
            };
            output: {
                chartData: {
                    date: string;
                    credits: number;
                }[];
                totalUsed: any;
                period: "day" | "week" | "month" | "year";
            };
            meta: object;
        }>;
        packages: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                packages: any;
            };
            meta: object;
        }>;
    }>>;
    plant: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        list: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number | undefined;
                offset?: number | undefined;
                filters?: {
                    tags?: string[] | undefined;
                    search?: string | undefined;
                    category?: string | undefined;
                    sunRequirements?: ("full_sun" | "partial_sun" | "shade")[] | undefined;
                    waterNeeds?: ("low" | "moderate" | "high")[] | undefined;
                    usdaZones?: string[] | undefined;
                    texasNative?: boolean | undefined;
                    droughtTolerant?: boolean | undefined;
                    favoritesOnly?: boolean | undefined;
                } | undefined;
                sortBy?: "name" | "category" | "scientific" | "water" | "sun" | undefined;
                sortOrder?: "asc" | "desc" | undefined;
            };
            output: {
                plants: any;
                total: any;
                hasMore: boolean;
            };
            meta: object;
        }>;
        get: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                id: string;
            };
            output: any;
            meta: object;
        }>;
        categories: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                name: string;
                count: number;
            }[];
            meta: object;
        }>;
        toggleFavorite: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                plantId: string;
            };
            output: {
                isFavorite: boolean;
            };
            meta: object;
        }>;
        favorites: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                plants: any;
            };
            meta: object;
        }>;
    }>>;
    project: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        list: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                search?: string | undefined;
                limit?: number | undefined;
                offset?: number | undefined;
                sortBy?: "status" | "name" | "recent" | undefined;
                filterStatus?: "active" | "all" | "completed" | "archived" | undefined;
            };
            output: {
                projects: any;
                total: any;
                hasMore: boolean;
            };
            meta: object;
        }>;
        stats: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                totalProjects: any;
                activeProjects: any;
                completedProjects: any;
                archivedProjects: any;
            };
            meta: object;
        }>;
        get: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                id: string;
            };
            output: any;
            meta: object;
        }>;
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                name: string;
                description?: string | undefined;
                address?: string | undefined;
                client_name?: string | undefined;
                client_email?: string | undefined;
                canvas_data?: Record<string, any> | undefined;
            };
            output: any;
            meta: object;
        }>;
        update: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                description?: string | undefined;
                status?: "active" | "completed" | "archived" | undefined;
                name?: string | undefined;
                address?: string | undefined;
                client_name?: string | undefined;
                client_email?: string | undefined;
                canvas_data?: Record<string, any> | undefined;
            };
            output: any;
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        listVersions: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                projectId: string;
                limit?: number | undefined;
                offset?: number | undefined;
            };
            output: {
                versions: any;
                total: any;
                hasMore: boolean;
            };
            meta: object;
        }>;
        createVersion: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId: string;
                snapshot: Record<string, any>;
                comment?: string | undefined;
            };
            output: any;
            meta: object;
        }>;
        getVersionDiff: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                versionIdA: string;
                versionIdB: string;
            };
            output: {
                diff: Record<string, {
                    from?: any;
                    to?: any;
                }>;
                snapshotA: Record<string, any>;
                snapshotB: Record<string, any>;
            };
            meta: object;
        }>;
        restoreVersion: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                versionId: string;
            };
            output: {
                restored: boolean;
            };
            meta: object;
        }>;
    }>>;
    scene: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        upload: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId: string;
                imageUrl: string;
                order?: number | undefined;
            };
            output: {
                success: boolean;
                scene: {
                    id: string;
                    projectId: string;
                    imageUrl: string;
                    order: number;
                    isDefault: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                };
            };
            meta: object;
        }>;
        reorder: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId: string;
                sceneIds: string[];
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        list: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                projectId: string;
            };
            output: {
                id: string;
                projectId: string;
                imageUrl: string;
                order: number;
                isDefault: boolean;
                createdAt: Date;
                updatedAt: Date;
            }[];
            meta: object;
        }>;
        getWithMasks: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId: string;
            };
            output: import("@terrashaper/shared").SceneWithMasks;
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                sceneId: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        setDefault: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId: string;
                sceneId: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
    }>>;
    mask: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        save: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                sceneId: string;
                masks: {
                    category: string;
                    path?: any;
                    id?: string | undefined;
                    authorId?: string | undefined;
                }[];
            };
            output: {
                success: boolean;
                message: string;
            };
            meta: object;
        }>;
        getByCategory: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId: string;
                category: string;
            };
            output: {
                path: unknown;
                id: string;
                sceneId: string;
                createdAt: Date;
                category: string;
                deleted: boolean;
                authorId: string | null;
            }[];
            meta: object;
        }>;
        getByScene: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId: string;
            };
            output: {
                path: unknown;
                id: string;
                sceneId: string;
                createdAt: Date;
                category: string;
                deleted: boolean;
                authorId: string | null;
            }[];
            meta: object;
        }>;
        history: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId: string;
            };
            output: import("@terrashaper/shared").MaskHistory[];
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                maskId: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        exportGeoJSON: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId: string;
            };
            output: any;
            meta: object;
        }>;
        getCategories: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId?: string | undefined;
            };
            output: string[];
            meta: object;
        }>;
    }>>;
    export: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        projectGeoJSON: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                projectId: string;
            };
            output: {
                type: string;
                properties: {
                    projectId: string;
                    exportDate: string;
                    totalScenes: number;
                    totalMasks: number;
                };
                features: any[];
            };
            meta: object;
        }>;
        sceneSprite: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId: string;
                format?: "png" | "svg" | undefined;
                resolution?: "1x" | "2x" | "4x" | undefined;
            };
            output: {
                spriteSheetUrl: string;
                format: "png" | "svg";
                resolution: "1x" | "2x" | "4x";
                maskCount: number;
                metadata: {
                    sceneId: string;
                    imageUrl: string;
                    generatedAt: string;
                };
            };
            meta: object;
        }>;
        projectSummary: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                projectId: string;
            };
            output: {
                projectId: string;
                totalScenes: number;
                totalMasks: number;
                categoryStats: Record<string, number>;
                sceneStats: {
                    sceneId: string;
                    imageUrl: string;
                    order: number;
                    isDefault: boolean;
                    maskCount: number;
                    categories: Record<string, number>;
                }[];
                exportedAt: string;
            };
            meta: object;
        }>;
    }>>;
    team: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        listMembers: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number | undefined;
                offset?: number | undefined;
            };
            output: {
                members: any;
                total: any;
                limit: number;
                offset: number;
            };
            meta: object;
        }>;
        createInvitation: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                email: string;
                role: "member" | "owner" | "admin" | "designer" | "viewer";
            };
            output: any;
            meta: object;
        }>;
        listInvitations: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number | undefined;
                offset?: number | undefined;
            };
            output: {
                invitations: any;
                limit: number;
                offset: number;
            };
            meta: object;
        }>;
        cancelInvitation: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                invitationId: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        updateUserRole: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                role: "member" | "owner" | "admin" | "designer" | "viewer";
                userId: string;
            };
            output: any;
            meta: object;
        }>;
        removeUser: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                userId: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        getActivityLogs: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                userId?: string | undefined;
                limit?: number | undefined;
                offset?: number | undefined;
                action?: string | undefined;
            };
            output: {
                logs: any;
                total: any;
                limit: number;
                offset: number;
            };
            meta: object;
        }>;
    }>>;
    clientPortal: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        createAccessLink: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId: string;
                permissions?: {
                    view?: boolean | undefined;
                    comment?: boolean | undefined;
                    approve?: boolean | undefined;
                } | undefined;
                clientEmail?: string | undefined;
                clientName?: string | undefined;
                expiresIn?: number | undefined;
            };
            output: any;
            meta: object;
        }>;
        listAccessLinks: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                projectId: string;
            };
            output: any;
            meta: object;
        }>;
        revokeAccessLink: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                linkId: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        createApprovalRequest: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId: string;
                notes?: string | undefined;
                versionId?: string | undefined;
            };
            output: any;
            meta: object;
        }>;
        listApprovals: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                projectId: string;
                status?: string | undefined;
            };
            output: any;
            meta: object;
        }>;
        updateApprovalStatus: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                status: "pending" | "approved" | "rejected" | "revision_requested";
                approvalId: string;
                notes?: string | undefined;
            };
            output: any;
            meta: object;
        }>;
        createComment: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId: string;
                content: string;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
                parentId?: string | undefined;
                clientAccessToken?: string | undefined;
            };
            output: any;
            meta: object;
        }>;
        listComments: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                projectId: string;
                includeResolved?: boolean | undefined;
            };
            output: any;
            meta: object;
        }>;
        resolveComment: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                commentId: string;
                resolved: boolean;
            };
            output: any;
            meta: object;
        }>;
        getClientProject: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                token: string;
            };
            output: {
                project: any;
                permissions: any;
                clientName: any;
            };
            meta: object;
        }>;
        createClientComment: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId: string;
                token: string;
                content: string;
                authorEmail: string;
                authorName: string;
                position?: {
                    x: number;
                    y: number;
                } | undefined;
            };
            output: any;
            meta: object;
        }>;
        submitClientApproval: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                status: "approved" | "rejected" | "revision_requested";
                token: string;
                approvalId: string;
                approverEmail: string;
                approverName: string;
                notes?: string | undefined;
            };
            output: any;
            meta: object;
        }>;
    }>>;
    billing: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: {
            data: {
                zodError: z.typeToFlattenedError<any, string> | null;
                code: import("@trpc/server").TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: import("@trpc/server").TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        getPlans: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: any;
            meta: object;
        }>;
        getCurrentSubscription: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: any;
            meta: object;
        }>;
        createCheckoutSession: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                priceId: string;
                successUrl: string;
                cancelUrl: string;
            };
            output: {
                sessionId: any;
                url: any;
            };
            meta: object;
        }>;
        createPortalSession: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                returnUrl: string;
            };
            output: {
                url: any;
            };
            meta: object;
        }>;
        updateSubscription: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                priceId: string;
                prorationBehavior?: "create_prorations" | "none" | "always_invoice" | undefined;
            };
            output: any;
            meta: object;
        }>;
        cancelSubscription: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                cancelAtPeriodEnd?: boolean | undefined;
                reason?: string | undefined;
            };
            output: any;
            meta: object;
        }>;
        getPaymentMethods: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: any;
            meta: object;
        }>;
        addPaymentMethod: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                paymentMethodId: string;
                setAsDefault?: boolean | undefined;
            };
            output: any;
            meta: object;
        }>;
        getInvoices: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number | undefined;
                offset?: number | undefined;
            };
            output: {
                invoices: any;
                total: any;
                limit: number;
                offset: number;
            };
            meta: object;
        }>;
        getUsageSummary: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                usage: {
                    renders: number;
                    storage: number;
                    apiCalls: number;
                };
                limits: {
                    renders: any;
                };
                period: {
                    start: string;
                    end: string;
                };
            };
            meta: object;
        }>;
        getSubscription: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                organization: any;
                subscription: {
                    id: any;
                    status: any;
                    currentPeriodEnd: any;
                    cancelAt: any;
                    canceledAt: any;
                    tier: any;
                    plan: any;
                };
            };
            meta: object;
        }>;
        checkFeature: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                feature: string;
            };
            output: {
                hasAccess: any;
                feature: string;
            };
            meta: object;
        }>;
        checkUsageLimit: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limitType: "projects" | "team_members" | "renders" | "storage_gb";
                currentUsage?: number | undefined;
            };
            output: any;
            meta: object;
        }>;
        getCurrentOverages: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: any;
            meta: object;
        }>;
        getOverageHistory: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number | undefined;
                offset?: number | undefined;
            };
            output: {
                charges: any;
                total: any;
                limit: number;
                offset: number;
            };
            meta: object;
        }>;
    }>>;
    hello: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            name: string;
        };
        output: {
            text: string;
        };
        meta: object;
    }>;
}>>;
export type AppRouter = typeof appRouter;
