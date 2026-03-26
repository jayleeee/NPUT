import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import type { TestStatus } from '../types';

const STATUS_LABELS: Record<TestStatus, string> = {
  preparing: '준비중',
  in_progress: '진행중',
  completed: '완료',
};

const STATUS_COLORS: Record<TestStatus, string> = {
  preparing: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function Dashboard() {
  const { tests, addTest, addToast } = useStore();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      addToast({ type: 'error', message: '테스트 이름을 입력해주세요.' });
      return;
    }
    if (!purpose.trim()) {
      addToast({ type: 'error', message: '테스트 목적을 입력해주세요.' });
      return;
    }
    setIsCreating(true);
    const newTest = addTest({ name: name.trim(), purpose: purpose.trim(), images });
    setIsCreating(false);
    setShowModal(false);
    resetForm();
    addToast({ type: 'success', message: '테스트가 생성되었습니다.' });
    navigate(`/test/${newTest.id}`);
  };

  const resetForm = () => {
    setName('');
    setPurpose('');
    setImages([]);
  };

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-dark">대시보드</h1>
            <p className="text-sub text-sm mt-0.5">사용자 테스트를 관리하세요</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
            style={{ backgroundColor: '#09AB49' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 테스트 만들기
          </button>
        </div>

        {/* Stats */}
        {tests.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: '전체 테스트', value: tests.length, color: 'text-dark' },
              { label: '진행중', value: tests.filter((t) => t.status === 'in_progress').length, color: 'text-blue-600' },
              { label: '완료', value: tests.filter((t) => t.status === 'completed').length, color: 'text-primary' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-outline p-5">
                <p className="text-sub text-sm mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tests Grid */}
        {tests.length === 0 ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tests.map((test) => (
              <div
                key={test.id}
                onClick={() => navigate(`/test/${test.id}`)}
                className="bg-white rounded-2xl border border-gray-outline p-5 cursor-pointer hover:shadow-md hover:border-primary transition-all group"
              >
                {/* Preview */}
                {test.images.length > 0 ? (
                  <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-gray-bg">
                    <img
                      src={test.images[0]}
                      alt="preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-36 rounded-xl mb-4 flex items-center justify-center bg-gray-bg">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-dark text-base group-hover:text-primary transition-colors line-clamp-1">
                    {test.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${STATUS_COLORS[test.status]}`}>
                    {STATUS_LABELS[test.status]}
                  </span>
                </div>

                <p className="text-sub text-sm line-clamp-2 mb-4">{test.purpose}</p>

                <div className="flex items-center justify-between text-xs text-sub">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    테스터 {test.testers.length}명
                  </div>
                  <span>{formatDate(test.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title="새 테스트 만들기"
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              테스트 이름 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 결제 플로우 사용성 테스트"
              className="w-full border border-gray-outline rounded-xl px-4 py-2.5 text-sm text-dark placeholder-sub focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">
              테스트 목적 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="어떤 것을 검증하고 싶은지 자세히 기술해주세요. AI가 이를 바탕으로 가이드와 시나리오를 생성합니다."
              rows={4}
              className="w-full border border-gray-outline rounded-xl px-4 py-2.5 text-sm text-dark placeholder-sub focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">화면 이미지 업로드</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-outline rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary-50 transition-all"
            >
              <svg className="w-8 h-8 text-sub mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-sub">클릭하여 이미지 선택</p>
              <p className="text-xs text-sub mt-0.5">PNG, JPG, WebP (복수 선택 가능)</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />

            {images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-outline" />
                    <button
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setShowModal(false); resetForm(); }}
              className="flex-1 border border-gray-outline text-sub rounded-xl py-2.5 text-sm font-medium hover:bg-gray-bg transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex-1 text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              style={{ backgroundColor: '#09AB49' }}
            >
              {isCreating ? '생성 중...' : '테스트 생성'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 mx-auto" style={{ backgroundColor: '#E8F9EF' }}>
        <svg className="w-12 h-12" style={{ color: '#09AB49' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-dark mb-2">아직 테스트가 없어요</h3>
      <p className="text-sub text-sm max-w-xs mb-6">
        첫 번째 사용자 테스트를 만들어보세요. AI가 가이드 작성부터 인사이트 분석까지 도와드립니다.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
        style={{ backgroundColor: '#09AB49' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        첫 테스트 만들기
      </button>
    </div>
  );
}
