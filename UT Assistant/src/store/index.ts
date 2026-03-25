import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Test, Tester, Toast } from '../types';

const AUTH_CODE = 'paystudio12!';

const generateId = () => Math.random().toString(36).slice(2, 11);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      apiKey: null,
      tests: [],
      toasts: [],

      login: (code: string) => {
        if (code === AUTH_CODE) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      setApiKey: (key: string) => {
        set({ apiKey: key });
      },

      addTest: (testData) => {
        const newTest: Test = {
          id: generateId(),
          name: testData.name,
          purpose: testData.purpose,
          images: testData.images,
          status: 'preparing',
          createdAt: new Date().toISOString(),
          testers: [],
        };
        set((state) => ({ tests: [newTest, ...state.tests] }));
        return newTest;
      },

      updateTest: (id, updates) => {
        set((state) => ({
          tests: state.tests.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTest: (id) => {
        set((state) => ({ tests: state.tests.filter((t) => t.id !== id) }));
      },

      getTest: (id) => {
        return get().tests.find((t) => t.id === id);
      },

      addTester: (testId, testerData) => {
        const newTester: Tester = {
          id: generateId(),
          ...testerData,
        };
        set((state) => ({
          tests: state.tests.map((t) =>
            t.id === testId ? { ...t, testers: [...t.testers, newTester] } : t
          ),
        }));
      },

      updateTester: (testId, testerId, updates) => {
        set((state) => ({
          tests: state.tests.map((t) =>
            t.id === testId
              ? {
                  ...t,
                  testers: t.testers.map((tester) =>
                    tester.id === testerId ? { ...tester, ...updates } : tester
                  ),
                }
              : t
          ),
        }));
      },

      deleteTester: (testId, testerId) => {
        set((state) => ({
          tests: state.tests.map((t) =>
            t.id === testId
              ? { ...t, testers: t.testers.filter((tester) => tester.id !== testerId) }
              : t
          ),
        }));
      },

      addToast: (toast) => {
        const id = generateId();
        const newToast: Toast = { id, ...toast };
        set((state) => ({ toasts: [...state.toasts, newToast] }));
        setTimeout(() => {
          get().removeToast(id);
        }, 3500);
      },

      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },
    }),
    {
      name: 'ut-assistant-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        apiKey: state.apiKey,
        tests: state.tests,
      }),
    }
  )
);
