import { Stripe } from 'stripe';

interface ProjectService {
    create(data: CreateProjectInput): Promise<Project>;
    findById(id: string): Promise<Project | null>;
    findByUserId(userId: string): Promise<Project[]>;
    findByOrganizationId(organizationId: string): Promise<Project[]>;
    update(id: string, data: UpdateProjectInput): Promise<Project>;
    delete(id: string): Promise<void>;
    createVersion(data: CreateVersionInput): Promise<ProjectVersion>;
    getVersions(projectId: string): Promise<ProjectVersion[]>;
    getStats(organizationId: string): Promise<ProjectStats>;
}
interface CreateProjectInput {
    name: string;
    description?: string;
    organization_id: string;
    user_id: string;
    canvas_data?: any;
    metadata?: Record<string, any>;
}
interface UpdateProjectInput {
    name?: string;
    description?: string;
    canvas_data?: any;
    metadata?: Record<string, any>;
    status?: string;
}
interface Project {
    id: string;
    name: string;
    description?: string;
    organization_id: string;
    user_id: string;
    canvas_data?: any;
    metadata?: Record<string, any>;
    status?: string;
    created_at: Date;
    updated_at: Date;
}
interface CreateVersionInput {
    project_id: string;
    version_number: number;
    canvas_data: any;
    metadata?: Record<string, any>;
    created_by: string;
}
interface ProjectVersion {
    id: string;
    project_id: string;
    version_number: number;
    canvas_data: any;
    metadata?: Record<string, any>;
    created_by: string;
    created_at: Date;
}
interface ProjectStats {
    total: number;
    byStatus: Record<string, number>;
    recentActivity: RecentActivity[];
}
interface RecentActivity {
    projectId: string;
    projectName: string;
    action: 'created' | 'updated' | 'rendered';
    timestamp: Date;
    userId: string;
    userName?: string;
}
declare class ProjectServiceImpl implements ProjectService {
    create(data: CreateProjectInput): Promise<Project>;
    findById(id: string): Promise<Project | null>;
    findByUserId(userId: string): Promise<Project[]>;
    findByOrganizationId(organizationId: string): Promise<Project[]>;
    update(id: string, data: UpdateProjectInput): Promise<Project>;
    delete(id: string): Promise<void>;
    createVersion(data: CreateVersionInput): Promise<ProjectVersion>;
    getVersions(projectId: string): Promise<ProjectVersion[]>;
    getStats(organizationId: string): Promise<ProjectStats>;
}
declare const projectService: ProjectServiceImpl;

interface BillingService {
    createCustomer(userId: string, email: string): Promise<Stripe.Customer>;
    getSubscription(customerId: string): Promise<Stripe.Subscription | null>;
    updateSubscription(subscriptionId: string, priceId: string): Promise<Stripe.Subscription>;
    cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
    getUsage(customerId: string, period: {
        start: Date;
        end: Date;
    }): Promise<UsageData>;
    createPaymentIntent(amount: number, customerId: string): Promise<Stripe.PaymentIntent>;
    getPlans(): Promise<SubscriptionPlan[]>;
    getCurrentSubscription(organizationId: string): Promise<CurrentSubscription | null>;
    getInvoices(customerId: string, limit?: number): Promise<Invoice[]>;
    getBillingAlerts(organizationId: string): Promise<BillingAlert[]>;
}
interface UsageData {
    renders: {
        used: number;
        limit: number;
    };
    storage: {
        used: number;
        limit: number;
    };
    credits: {
        used: number;
        remaining: number;
    };
}
interface SubscriptionPlan {
    id: string;
    name: string;
    tier: string;
    price_monthly: number;
    price_yearly?: number;
    stripe_price_id: string;
    render_credits_monthly: number;
    max_projects: number;
    max_team_members: number;
    features: Record<string, any>;
}
interface CurrentSubscription {
    id: string;
    status: string;
    plan: SubscriptionPlan | null;
    current_period_end: string;
    cancel_at_period_end: boolean;
}
interface Invoice {
    id: string;
    invoice_number?: string | null;
    stripe_invoice_id: string;
    created_at: string;
    amount_due: number;
    currency: string;
    status: string;
    stripe_hosted_invoice_url?: string | null;
    stripe_invoice_pdf?: string | null;
}
interface BillingAlert {
    id: string;
    type: string;
    severity: 'error' | 'warning' | 'info';
    title: string;
    message: string;
    action?: {
        label: string;
        url: string;
    };
}
declare class BillingServiceImpl implements BillingService {
    private customerService;
    private subscriptionService;
    private paymentService;
    private invoiceService;
    private portalService;
    createCustomer(userId: string, email: string): Promise<Stripe.Customer>;
    getSubscription(customerId: string): Promise<Stripe.Subscription | null>;
    updateSubscription(subscriptionId: string, priceId: string): Promise<Stripe.Subscription>;
    cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
    getUsage(customerId: string, period: {
        start: Date;
        end: Date;
    }): Promise<UsageData>;
    createPaymentIntent(amount: number, customerId: string): Promise<Stripe.PaymentIntent>;
    getPlans(): Promise<SubscriptionPlan[]>;
    getCurrentSubscription(organizationId: string): Promise<CurrentSubscription | null>;
    getInvoices(customerId: string, limit?: number): Promise<Invoice[]>;
    getBillingAlerts(organizationId: string): Promise<BillingAlert[]>;
}
declare const billingService: BillingServiceImpl;

interface RenderService {
    createRenderJob(projectId: string, options: RenderOptions): Promise<RenderJob>;
    getRenderStatus(jobId: string): Promise<RenderStatus>;
    cancelRender(jobId: string): Promise<void>;
    getRenderHistory(projectId: string): Promise<RenderJob[]>;
    getCreditsUsage(organizationId: string, period: {
        start: Date;
        end: Date;
    }): Promise<CreditsUsage>;
    estimateCredits(params: EstimateCreditsInput): Promise<number>;
}
interface RenderOptions {
    quality: 'draft' | 'standard' | 'high' | 'ultra';
    format: 'png' | 'jpg' | 'webp';
    width: number;
    height: number;
    prompt?: string;
    style?: string;
    userId: string;
    organizationId: string;
}
interface RenderJob {
    id: string;
    projectId: string;
    status: RenderStatus;
    options: RenderOptions;
    createdAt: Date;
    completedAt?: Date;
    outputUrl?: string;
    error?: string;
    creditsUsed?: number;
}
type RenderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
interface CreditsUsage {
    total: number;
    byQuality: Record<string, number>;
    byProject: Array<{
        projectId: string;
        projectName: string;
        credits: number;
    }>;
    dailyUsage: Array<{
        date: string;
        credits: number;
    }>;
}
interface EstimateCreditsInput {
    quality: 'draft' | 'standard' | 'high' | 'ultra';
    resolution: string;
    style?: string;
}
declare class RenderServiceImpl implements RenderService {
    private creditCosts;
    createRenderJob(projectId: string, options: RenderOptions): Promise<RenderJob>;
    getRenderStatus(jobId: string): Promise<RenderStatus>;
    cancelRender(jobId: string): Promise<void>;
    getRenderHistory(projectId: string): Promise<RenderJob[]>;
    getCreditsUsage(organizationId: string, period: {
        start: Date;
        end: Date;
    }): Promise<CreditsUsage>;
    estimateCredits(params: EstimateCreditsInput): Promise<number>;
}
declare const renderService: RenderServiceImpl;

interface TeamService {
    createTeam(data: CreateTeamInput): Promise<Team>;
    findTeamById(id: string): Promise<Team | null>;
    updateTeam(id: string, data: UpdateTeamInput): Promise<Team>;
    deleteTeam(id: string): Promise<void>;
    addMember(teamId: string, userId: string, role: string): Promise<TeamMember>;
    removeMember(teamId: string, userId: string): Promise<void>;
    updateMemberRole(teamId: string, userId: string, role: string): Promise<TeamMember>;
    getTeamMembers(teamId: string): Promise<TeamMember[]>;
}
interface CreateTeamInput {
    name: string;
    organization_id: string;
    created_by: string;
    metadata?: Record<string, any>;
}
interface UpdateTeamInput {
    name?: string;
    metadata?: Record<string, any>;
}
interface Team {
    id: string;
    name: string;
    organization_id: string;
    created_by: string;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}
interface TeamMember {
    id: string;
    userId: string;
    teamId: string;
    role: string;
    joinedAt: Date;
    user?: {
        id: string;
        email: string;
        name: string;
        avatar?: string;
    };
}
declare class TeamServiceImpl implements TeamService {
    createTeam(data: CreateTeamInput): Promise<Team>;
    findTeamById(id: string): Promise<Team | null>;
    updateTeam(id: string, data: UpdateTeamInput): Promise<Team>;
    deleteTeam(id: string): Promise<void>;
    addMember(teamId: string, userId: string, role: string): Promise<TeamMember>;
    removeMember(teamId: string, userId: string): Promise<void>;
    updateMemberRole(teamId: string, userId: string, role: string): Promise<TeamMember>;
    getTeamMembers(teamId: string): Promise<TeamMember[]>;
}
declare const teamService: TeamServiceImpl;

interface StorageServiceInterface {
    uploadFile(bucket: string, file: File): Promise<UploadResult>;
    downloadFile(bucket: string, path: string): Promise<Buffer>;
    deleteFile(bucket: string, path: string): Promise<void>;
    listFiles(bucket: string, prefix?: string): Promise<StorageFile[]>;
    getFileUrl(bucket: string, path: string): string;
}
interface UploadResult {
    path: string;
    url: string;
    size: number;
    contentType: string;
}
interface StorageFile {
    path: string;
    size: number;
    contentType: string;
    lastModified: Date;
}

interface AuthService {
    getCurrentUser(): Promise<User | null>;
    getUserById(id: string): Promise<User | null>;
    updateUser(id: string, data: Partial<User>): Promise<User>;
    deleteUser(id: string): Promise<void>;
}
interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

export { type AuthService, type BillingAlert, type BillingService, BillingServiceImpl, type CreateProjectInput, type CreateTeamInput, type CreateVersionInput, type CreditsUsage, type CurrentSubscription, type EstimateCreditsInput, type Invoice, type Project, type ProjectService, ProjectServiceImpl, type ProjectStats, type ProjectVersion, type RecentActivity, type RenderJob, type RenderOptions, type RenderService, RenderServiceImpl, type RenderStatus, type StorageFile, type StorageServiceInterface, type SubscriptionPlan, type Team, type TeamMember, type TeamService, TeamServiceImpl, type UpdateProjectInput, type UpdateTeamInput, type UploadResult, type UsageData, type User, billingService, projectService, renderService, teamService };
