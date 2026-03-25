import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { GuideTab } from './tabs/GuideTab';
import { TestersTab } from './tabs/TestersTab';
import { ResultsTab } from './tabs/ResultsTab';
import { AnnotationsTab } from './tabs/AnnotationsTab';
import type { TestStatus } from '../types';

type TabId = 'guide' | 'testers' | 'results' | 'annotations';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'guide',
    label: '가이드',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'testers',
    label: '테스터',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'results',
    label: '결과',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'annotations',
    label: '개선안',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
  },
];

const STATUS_MAP: Record<TestStatus, { label: string; color: string; next: TestStatus | null }> = {
  preparing: { label: '준비중', color: 'bg-yellow-100 text-yellow-700', next: 'in_progress' },
  in_progress: { label: '진행중', color: 'bg-blue-100 text-blue-700', next: 'completed' },
  completed: { label: '완료', color: 'bg-green-100 text-green-700', next: null },
};

export function TestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTest, updateTest, deleteTest, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<TabId>('guide');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const test = getTest(id || '');

  if (!test) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-sub text-lg mb-4">테스트를 찾을 수 없습니다.</p>
          <Link to="/dashboard" className="text-primary hover:underline text-sm">
            대시보드로 돌아가기
          </Link>
        </div>
      </Layout>
    );
  }

  const statusInfo = STATUS_MAP[test.status];

  const handleAdvanceStatus = () => {
    if (!statusInfo.next) return;
    updateTest(test.id, { status: statusInfo.next });
    addToast({ type: 'success', message: `상태가 "${STATUS_MAP[statusInfo.next].label}"로 변경되었습니다.` });
  };

  const handleDelete = () => {
    deleteTest(test.id);
    navigate('/dashboard');
    addToast({ type: 'info', message: '테스트가 삭제되었습니다.' });
  };

  return (
    <Layout>
      <div className="p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-sub mb-6">
          <Link to="/dashboard" className="hover:text-primary transition-colors">대시보드</Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-dark font-medium">{test.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-5 mb-7">
          {/* Images preview */}
          {test.images.length > 0 && (
            <button
              onClick={() => setShowImageModal(true)}
              className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-outline hover:opacity-80 transition-opacity"
            >
              <img src={test.images[0]} alt="preview" className="w-full h-full object-cover" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-2xl font-bold text-dark truncate">{test.name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sub text-sm leading-relaxed max-w-2xl">{test.purpose}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-sub">
              <span>테스터 {test.testers.length}명</span>
              <span>이미지 {test.images.length}장</span>
              <span>
                {new Date(test.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {statusInfo.next && (
              <button
                onClick={handleAdvanceStatus}
                className="px-4 py-2 border border-primary text-primary rounded-xl text-sm font-medium hover:bg-primary-50 transition-all"
              >
                {STATUS_MAP[statusInfo.next].label}로 변경
              </button>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-sub hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-outline p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-white shadow-sm'
                  : 'text-sub hover:text-dark'
              }`}
              style={activeTab === tab.id ? { backgroundColor: '#09AB49' } : {}}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'testers' && test.testers.length > 0 && (
                <span
                  className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${
                    activeTab === tab.id ? 'bg-white text-primary' : 'bg-primary-50 text-primary'
                  }`}
                >
                  {test.testers.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'guide' && <GuideTab test={test} />}
        {activeTab === 'testers' && <TestersTab test={test} />}
        {activeTab === 'results' && <ResultsTab test={test} />}
        {activeTab === 'annotations' && <AnnotationsTab test={test} />}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="테스트 삭제"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-sub">
            <strong className="text-dark">{test.name}</strong>을(를) 삭제하면 모든 데이터(테스터, 결과, 인사이트)가 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 border border-gray-outline text-sub rounded-xl py-2.5 text-sm font-medium hover:bg-gray-bg transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Gallery Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title={`화면 이미지 (${test.images.length}장)`}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-3">
          {test.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`화면 ${i + 1}`}
              className="w-full rounded-xl border border-gray-outline object-contain max-h-64"
            />
          ))}
        </div>
      </Modal>
    </Layout>
  );
}
