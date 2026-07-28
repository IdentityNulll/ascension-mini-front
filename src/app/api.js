import { createApi } from '@reduxjs/toolkit/query/react';
import { http } from '../lib/axios';

/** RTK Query base query backed by axios (satisfies both RTK Query + Axios). */
const axiosBaseQuery =
  () =>
  async ({ url, method = 'get', data, params }) => {
    try {
      const res = await http({ url, method, data, params });
      const body = res.data;
      // Our API always responds with a { ok, data } envelope. Anything else
      // (e.g. an HTML index.html fallback, or a proxy/gateway error page) is
      // treated as an error so a non-array body can never reach the UI and
      // crash a `.filter`/`.map` during render.
      if (body && typeof body === 'object' && 'ok' in body) {
        if (body.ok) return { data: body.data };
        return {
          error: {
            status: res.status,
            message: body.error?.message || 'Request failed',
            details: body.error?.details,
          },
        };
      }
      return {
        error: {
          status: res.status,
          message: 'Unexpected response from the API. Is the backend reachable?',
        },
      };
    } catch (err) {
      const payload = err.response?.data?.error;
      return {
        error: {
          status: err.response?.status,
          message: payload?.message || err.message,
          details: payload?.details,
        },
      };
    }
  };

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Category', 'Quest', 'QuestEntry', 'ShopItem', 'Purchase',
    'Metric', 'MetricEntry', 'Analytics', 'Balance', 'Reminder', 'Notification', 'Profile',
    'Journal', 'JournalStats', 'Morning', 'MorningStats',
  ],
  endpoints: (b) => ({
    // --- Balance ---
    getBalance: b.query({ query: () => ({ url: '/balance' }), providesTags: ['Balance'] }),

    // --- Categories ---
    getCategories: b.query({ query: () => ({ url: '/categories' }), providesTags: ['Category'] }),
    createCategory: b.mutation({
      query: (data) => ({ url: '/categories', method: 'post', data }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: b.mutation({
      query: ({ id, ...data }) => ({ url: `/categories/${id}`, method: 'put', data }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: b.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: 'delete' }),
      invalidatesTags: ['Category', 'Quest'],
    }),
    reorderCategories: b.mutation({
      query: (ids) => ({ url: '/categories/reorder', method: 'put', data: { ids } }),
      invalidatesTags: ['Category'],
    }),

    // --- Quests ---
    getQuests: b.query({ query: () => ({ url: '/quests' }), providesTags: ['Quest'] }),
    createQuest: b.mutation({
      query: (data) => ({ url: '/quests', method: 'post', data }),
      invalidatesTags: ['Quest', 'Analytics'],
    }),
    updateQuest: b.mutation({
      query: ({ id, ...data }) => ({ url: `/quests/${id}`, method: 'put', data }),
      invalidatesTags: ['Quest', 'Analytics'],
    }),
    deleteQuest: b.mutation({
      query: (id) => ({ url: `/quests/${id}`, method: 'delete' }),
      invalidatesTags: ['Quest', 'QuestEntry', 'Analytics', 'Balance'],
    }),
    reorderQuests: b.mutation({
      query: (ids) => ({ url: '/quests/reorder', method: 'put', data: { ids } }),
      invalidatesTags: ['Quest'],
    }),

    // --- Quest entries ---
    getQuestEntries: b.query({
      query: (month) => ({ url: '/quest-entries', params: { month } }),
      providesTags: ['QuestEntry'],
    }),
    upsertQuestEntry: b.mutation({
      query: (data) => ({ url: '/quest-entries', method: 'put', data }),
      invalidatesTags: ['QuestEntry', 'Analytics', 'Balance', 'Reminder'],
    }),

    // --- Shop ---
    getShopItems: b.query({ query: () => ({ url: '/shop-items' }), providesTags: ['ShopItem'] }),
    createShopItem: b.mutation({
      query: (data) => ({ url: '/shop-items', method: 'post', data }),
      invalidatesTags: ['ShopItem'],
    }),
    updateShopItem: b.mutation({
      query: ({ id, ...data }) => ({ url: `/shop-items/${id}`, method: 'put', data }),
      invalidatesTags: ['ShopItem'],
    }),
    deleteShopItem: b.mutation({
      query: (id) => ({ url: `/shop-items/${id}`, method: 'delete' }),
      invalidatesTags: ['ShopItem'],
    }),

    // --- Purchases ---
    getPurchases: b.query({
      query: (month) => ({ url: '/purchases', params: { month } }),
      providesTags: ['Purchase'],
    }),
    buy: b.mutation({
      query: (data) => ({ url: '/purchases', method: 'post', data }),
      invalidatesTags: ['Purchase', 'Balance', 'Analytics', 'Reminder'],
    }),
    deletePurchase: b.mutation({
      query: (id) => ({ url: `/purchases/${id}`, method: 'delete' }),
      invalidatesTags: ['Purchase', 'Balance', 'Analytics'],
    }),

    // --- Metrics ---
    getMetrics: b.query({ query: () => ({ url: '/metrics' }), providesTags: ['Metric'] }),
    createMetric: b.mutation({
      query: (data) => ({ url: '/metrics', method: 'post', data }),
      invalidatesTags: ['Metric'],
    }),
    updateMetric: b.mutation({
      query: ({ id, ...data }) => ({ url: `/metrics/${id}`, method: 'put', data }),
      invalidatesTags: ['Metric'],
    }),
    deleteMetric: b.mutation({
      query: (id) => ({ url: `/metrics/${id}`, method: 'delete' }),
      invalidatesTags: ['Metric', 'MetricEntry'],
    }),

    // --- Metric entries ---
    getMetricEntries: b.query({
      query: (month) => ({ url: '/metric-entries', params: { month } }),
      providesTags: ['MetricEntry'],
    }),
    upsertMetricEntry: b.mutation({
      query: (data) => ({ url: '/metric-entries', method: 'put', data }),
      invalidatesTags: ['MetricEntry', 'Reminder'],
    }),

    // --- Analytics ---
    getXpAnalytics: b.query({
      query: (month) => ({ url: '/analytics/xp', params: { month } }),
      providesTags: ['Analytics'],
    }),
    getSpendingAnalytics: b.query({
      query: (month) => ({ url: '/analytics/spending', params: { month } }),
      providesTags: ['Analytics'],
    }),
    getProductivityAnalytics: b.query({
      query: (month) => ({ url: '/analytics/productivity', params: { month } }),
      providesTags: ['Analytics'],
    }),

    // --- Profile (About Me) ---
    getProfile: b.query({ query: () => ({ url: '/profile' }), providesTags: ['Profile'] }),
    updateProfile: b.mutation({
      query: (data) => ({ url: '/profile', method: 'put', data }),
      invalidatesTags: ['Profile'],
    }),

    // --- Journal ---
    getJournalMonth: b.query({
      query: (month) => ({ url: '/journal', params: { month } }),
      providesTags: ['Journal'],
    }),
    getJournalDay: b.query({
      query: (date) => ({ url: `/journal/day/${date}` }),
      providesTags: ['Journal'],
    }),
    getJournalStats: b.query({ query: () => ({ url: '/journal/stats' }), providesTags: ['JournalStats'] }),
    upsertJournal: b.mutation({
      query: (data) => ({ url: '/journal', method: 'put', data }),
      invalidatesTags: ['Journal', 'JournalStats'],
    }),

    // --- Morning routine ---
    getMorningMonth: b.query({
      query: (month) => ({ url: '/morning', params: { month } }),
      providesTags: ['Morning'],
    }),
    getMorningDay: b.query({
      query: (date) => ({ url: `/morning/day/${date}` }),
      providesTags: ['Morning'],
    }),
    getMorningStats: b.query({ query: () => ({ url: '/morning/stats' }), providesTags: ['MorningStats'] }),
    upsertMorning: b.mutation({
      query: (data) => ({ url: '/morning', method: 'put', data }),
      invalidatesTags: ['Morning', 'MorningStats'],
    }),

    // --- Reminders / notifications ---
    getTodayReminder: b.query({ query: () => ({ url: '/reminders/today' }), providesTags: ['Reminder'] }),
    getNotifications: b.query({ query: () => ({ url: '/notifications' }), providesTags: ['Notification'] }),
    markNotificationRead: b.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'put' }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: b.mutation({
      query: () => ({ url: '/notifications/read-all', method: 'put' }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetBalanceQuery,
  useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, useReorderCategoriesMutation,
  useGetQuestsQuery, useCreateQuestMutation, useUpdateQuestMutation, useDeleteQuestMutation, useReorderQuestsMutation,
  useGetQuestEntriesQuery, useUpsertQuestEntryMutation,
  useGetShopItemsQuery, useCreateShopItemMutation, useUpdateShopItemMutation, useDeleteShopItemMutation,
  useGetPurchasesQuery, useBuyMutation, useDeletePurchaseMutation,
  useGetMetricsQuery, useCreateMetricMutation, useUpdateMetricMutation, useDeleteMetricMutation,
  useGetMetricEntriesQuery, useUpsertMetricEntryMutation,
  useGetXpAnalyticsQuery, useGetSpendingAnalyticsQuery, useGetProductivityAnalyticsQuery,
  useGetTodayReminderQuery, useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation,
  useGetProfileQuery, useUpdateProfileMutation,
  useGetJournalMonthQuery, useGetJournalDayQuery, useGetJournalStatsQuery, useUpsertJournalMutation,
  useGetMorningMonthQuery, useGetMorningDayQuery, useGetMorningStatsQuery, useUpsertMorningMutation,
} = api;
