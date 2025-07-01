export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        session: import("./context").Session;
        supabase: import("./context").SupabaseClient;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    health: import("@trpc/server").TRPCBuiltRouter<{
        ctx: {
            session: import("./context").Session;
            supabase: import("./context").SupabaseClient;
        };
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
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
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId?: string;
                sceneId?: string;
                sourceImageUrl?: string;
                maskImageUrl?: string;
                prompt?: {
                    system?: string;
                    user?: string;
                };
                annotations?: {
                    type?: "mask" | "assetInstance" | "textLabel";
                    data?: any;
                }[];
                settings?: {
                    provider?: "google-imagen" | "openai-gpt-image";
                    resolution?: "1024x1024" | "2048x2048" | "4096x4096";
                    format?: "PNG" | "JPEG";
                    quality?: number;
                };
            };
            output: {
                renderId: string;
                jobId: string;
                status: string;
            };
            meta: object;
        }>;
        status: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                renderId?: string;
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
                renderId?: string;
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
                renderId?: string;
            };
            output: {
                renderId: string;
                jobId: string;
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
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        generateUploadUrl: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                fileName?: string;
                contentType?: string;
                bucketType?: "renders" | "assets";
                expiresInMinutes?: number;
            };
            output: {
                uploadUrl: any;
                fileName: any;
                publicUrl: string;
                expiresAt: Date;
            };
            meta: object;
        }>;
        generateDownloadUrl: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                fileName?: string;
                bucketType?: "renders" | "assets";
                expiresInMinutes?: number;
            };
            output: {
                downloadUrl: any;
                fileName: string;
                expiresAt: Date;
            };
            meta: object;
        }>;
        fileExists: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                fileName?: string;
                bucketType?: "renders" | "assets";
            };
            output: {
                exists: any;
                fileName: string;
            };
            meta: object;
        }>;
        getFileMetadata: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                fileName?: string;
                bucketType?: "renders" | "assets";
            };
            output: {
                fileName: string;
                size: any;
                contentType: any;
                created: any;
                updated: any;
                etag: any;
            };
            meta: object;
        }>;
        deleteFile: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                fileName?: string;
                bucketType?: "renders" | "assets";
            };
            output: {
                success: boolean;
                fileName: string;
            };
            meta: object;
        }>;
        generateFileName: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                type?: "render" | "asset" | "upload";
                id?: string;
                originalFileName?: string;
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
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
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
                limit?: number;
                offset?: number;
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
                period?: "day" | "week" | "month" | "year";
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
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        list: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number;
                offset?: number;
                filters?: {
                    search?: string;
                    category?: string;
                    sunRequirements?: ("full_sun" | "partial_sun" | "shade")[];
                    waterNeeds?: ("low" | "moderate" | "high")[];
                    usdaZones?: string[];
                    texasNative?: boolean;
                    droughtTolerant?: boolean;
                    tags?: string[];
                    favoritesOnly?: boolean;
                };
                sortBy?: "category" | "name" | "scientific" | "water" | "sun";
                sortOrder?: "asc" | "desc";
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
                id?: string;
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
                plantId?: string;
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
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        list: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                search?: string;
                limit?: number;
                offset?: number;
                sortBy?: "status" | "name" | "recent";
                filterStatus?: "completed" | "all" | "active" | "archived";
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
                id?: string;
            };
            output: any;
            meta: object;
        }>;
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                description?: string;
                name?: string;
                address?: string;
                client_name?: string;
                client_email?: string;
                canvas_data?: Record<string, any>;
            };
            output: any;
            meta: object;
        }>;
        update: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                description?: string;
                status?: "completed" | "active" | "archived";
                id?: string;
                name?: string;
                address?: string;
                client_name?: string;
                client_email?: string;
                canvas_data?: Record<string, any>;
            };
            output: any;
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id?: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        listVersions: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                projectId?: string;
                limit?: number;
                offset?: number;
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
                projectId?: string;
                snapshot?: Record<string, any>;
                comment?: string;
            };
            output: any;
            meta: object;
        }>;
        getVersionDiff: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                versionIdA?: string;
                versionIdB?: string;
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
                versionId?: string;
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
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        upload: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId?: string;
                imageUrl?: string;
                order?: number;
            };
            output: {
                success: boolean;
                scene: {
                    projectId: string;
                    imageUrl: string;
                    id: string;
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
                projectId?: string;
                sceneIds?: string[];
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        list: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                projectId?: string;
            };
            output: {
                projectId: string;
                imageUrl: string;
                id: string;
                order: number;
                isDefault: boolean;
                createdAt: Date;
                updatedAt: Date;
            }[];
            meta: object;
        }>;
        getWithMasks: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId?: string;
            };
            output: import("packages/shared/dist").SceneWithMasks;
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                sceneId?: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        setDefault: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                projectId?: string;
                sceneId?: string;
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
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        save: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                sceneId?: string;
                masks?: {
                    path?: any;
                    id?: string;
                    category?: string;
                    authorId?: string;
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
                sceneId?: string;
                category?: string;
            };
            output: {
                path: unknown;
                sceneId: string;
                id: string;
                category: string;
                createdAt: Date;
                authorId: string;
                deleted: boolean;
            }[];
            meta: object;
        }>;
        getByScene: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId?: string;
            };
            output: {
                path: unknown;
                sceneId: string;
                id: string;
                category: string;
                createdAt: Date;
                authorId: string;
                deleted: boolean;
            }[];
            meta: object;
        }>;
        history: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId?: string;
            };
            output: import("packages/shared/dist").MaskHistory[];
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                maskId?: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        exportGeoJSON: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId?: string;
            };
            output: any;
            meta: object;
        }>;
        getCategories: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                sceneId?: string;
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
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        projectGeoJSON: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                projectId?: string;
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
                sceneId?: string;
                resolution?: "1x" | "2x" | "4x";
                format?: "png" | "svg";
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
                projectId?: string;
            };
            output: {
                projectId: string;
                totalScenes: number;
                totalMasks: number;
                categoryStats: Record<string, number>;
                sceneStats: any[];
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
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        listMembers: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number;
                offset?: number;
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
                role: "admin" | "member" | "owner" | "designer" | "viewer";
            };
            output: any;
            meta: object;
        }>;
        listInvitations: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number;
                offset?: number;
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
                invitationId?: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        updateUserRole: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                role: "admin" | "member" | "owner" | "designer" | "viewer";
                userId: string;
            };
            output: any;
            meta: object;
        }>;
        removeUser: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                userId?: string;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
        getActivityLogs: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                userId?: string;
                limit?: number;
                offset?: number;
                action?: string;
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
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
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
                projectId?: string;
            };
            output: any;
            meta: object;
        }>;
        revokeAccessLink: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                linkId?: string;
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
                status?: string;
                projectId?: string;
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
                projectId?: string;
                includeResolved?: boolean;
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
                token?: string;
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
                projectId?: string;
                token?: string;
                content?: string;
                authorEmail?: string;
                authorName?: string;
                position?: {
                    x?: number;
                    y?: number;
                };
            };
            output: any;
            meta: object;
        }>;
        submitClientApproval: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                status?: "approved" | "rejected" | "revision_requested";
                token?: string;
                approvalId?: string;
                notes?: string;
                approverEmail?: string;
                approverName?: string;
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
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        getPlans: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: any;
            meta: object;
        }>;
        getCurrentSubscription: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: import("stripe").Stripe.Subscription;
            meta: object;
        }>;
        createCheckoutSession: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                priceId: string;
                successUrl: string;
                cancelUrl: string;
            };
            output: {
                sessionId: string;
                url: string;
            };
            meta: object;
        }>;
        createPortalSession: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                returnUrl: string;
            };
            output: {
                url: string;
            };
            meta: object;
        }>;
        updateSubscription: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                priceId: string;
                prorationBehavior?: "create_prorations" | "none" | "always_invoice" | undefined;
            };
            output: import("stripe").Stripe.Subscription;
            meta: object;
        }>;
        cancelSubscription: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                cancelAtPeriodEnd?: boolean | undefined;
                reason?: string | undefined;
            };
            output: import("stripe").Stripe.Subscription;
            meta: object;
        }>;
        getPaymentMethods: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: {
                id: any;
                type: any;
                brand: any;
                last4: any;
                expMonth: any;
                expYear: any;
                isDefault: any;
            }[];
            meta: object;
        }>;
        addPaymentMethod: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                paymentMethodId: string;
                setAsDefault?: boolean | undefined;
            };
            output: import("stripe").Stripe.PaymentMethod;
            meta: object;
        }>;
        getInvoices: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limit?: number;
                offset?: number;
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
                feature?: string;
            };
            output: {
                hasAccess: any;
                feature: string;
            };
            meta: object;
        }>;
        checkUsageLimit: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                limitType?: "renders" | "projects" | "team_members" | "storage_gb";
                currentUsage?: number;
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
                limit?: number;
                offset?: number;
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
            name?: string;
        };
        output: {
            text: string;
        };
        meta: object;
    }>;
}>>;
export type AppRouter = typeof appRouter;
