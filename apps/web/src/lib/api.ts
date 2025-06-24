// Placeholder API client - will be replaced with proper tRPC setup
const mockMutation = () => ({
  mutateAsync: async () => ({}),
  mutate: () => {},
  isLoading: false,
  error: null,
});

const mockQuery = (defaultData: any = null) => ({
  useQuery: () => ({
    data: defaultData,
    isLoading: false,
    error: null,
    refetch: () => {},
  }),
});

export const api = {
  billing: {
    getUsage: mockQuery(),
    getInvoices: mockQuery([]),
    getPaymentMethods: mockQuery([]),
    getSubscription: mockQuery(),
    getPlans: mockQuery([]),
    getBillingAlerts: mockQuery([]),
    getUsageAnalytics: mockQuery(),
    getUsageBreakdown: mockQuery(),
    getUsageSummary: mockQuery(),
    createCheckoutSession: mockMutation(),
    createPortalSession: mockMutation(),
    setDefaultPaymentMethod: mockMutation(),
    deletePaymentMethod: mockMutation(),
    attachPaymentMethod: mockMutation(),
    updateSubscription: mockMutation(),
    cancelSubscription: mockMutation(),
    reactivateSubscription: mockMutation(),
  },
  team: {
    listMembers: mockQuery({ members: [], total: 0 }),
    updateUserRole: mockMutation(),
    removeUser: mockMutation(),
    createInvitation: mockMutation(),
    getActivityLogs: mockQuery({ logs: [], total: 0 }),
  },
  clientPortal: {
    createAccessLink: mockMutation(),
    listComments: mockQuery([]),
    createComment: mockMutation(),
    resolveComment: mockMutation(),
    listApprovals: mockQuery([]),
    createApprovalRequest: mockMutation(),
  },
  project: {
    getAll: mockQuery([]),
  },
};
