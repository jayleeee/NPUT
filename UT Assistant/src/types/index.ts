export interface Tester {
  id: string;
  name: string;
  ageGroup: '20대' | '30대' | '40대' | '50대 이상';
  gender: '남' | '여' | '기타';
  job: string;
  digitalLiteracy: '낮음' | '보통' | '높음';
  memo: string;
  result?: {
    notes: string;
    rating: 'good' | 'neutral' | 'bad';
  };
}

export interface Scenario {
  id: string;
  order: number;
  content: string;
}

export interface Insight {
  id: string;
  title: string;
  content: string;
  evidence: string;
  category: string;
  position?: { x: number; y: number };
}

export interface InsightResult {
  taskInsights: Insight[];
  uxInsights: Insight[];
}

export interface AnnotationPoint {
  id: string;
  number: number;
  title: string;
  content: string;
  position: { x: number; y: number };
}

export interface ImageAnnotation {
  imageIndex: number;
  points: AnnotationPoint[];
}

export interface TestGuide {
  opening: string;
  questions: string[];
  closing: string;
}

export type TestStatus = 'preparing' | 'in_progress' | 'completed';

export interface Test {
  id: string;
  name: string;
  purpose: string;
  images: string[]; // base64
  status: TestStatus;
  createdAt: string;
  guide?: TestGuide;
  scenarios?: Scenario[];
  testers: Tester[];
  insights?: InsightResult;
  annotations?: ImageAnnotation[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AppState {
  isAuthenticated: boolean;
  apiKey: string | null;
  tests: Test[];
  toasts: Toast[];

  // Auth
  login: (code: string) => boolean;
  logout: () => void;

  // API Key
  setApiKey: (key: string) => void;

  // Tests
  addTest: (test: Omit<Test, 'id' | 'createdAt' | 'status' | 'testers'>) => Test;
  updateTest: (id: string, updates: Partial<Test>) => void;
  deleteTest: (id: string) => void;
  getTest: (id: string) => Test | undefined;

  // Testers
  addTester: (testId: string, tester: Omit<Tester, 'id'>) => void;
  updateTester: (testId: string, testerId: string, updates: Partial<Tester>) => void;
  deleteTester: (testId: string, testerId: string) => void;

  // Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
