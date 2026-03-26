import { useState } from 'react';
import { useStore } from '../../store';
import type { Test, Tester } from '../../types';

interface TestersTabProps {
  test: Test;
}

const AGE_GROUPS: Tester['ageGroup'][] = ['20대', '30대', '40대', '50대 이상'];
const GENDERS: Tester['gender'][] = ['남', '여', '기타'];
const LITERACY: Tester['digitalLiteracy'][] = ['낮음', '보통', '높음'];

const LITERACY_COLORS: Record<Tester['digitalLiteracy'], string> = {
  낮음: 'bg-red-100 text-red-700',
  보통: 'bg-yellow-100 text-yellow-700',
  높음: 'bg-green-100 text-green-700',
};

const RATING_MAP = {
  good: { label: '좋음', color: 'bg-green-100 text-green-700' },
  neutral: { label: '보통', color: 'bg-yellow-100 text-yellow-700' },
  bad: { label: '나쁨', color: 'bg-red-100 text-red-700' },
};

const emptyForm: Omit<Tester, 'id'> = {
  name: '',
  ageGroup: '30대',
  gender: '여',
  job: '',
  digitalLiteracy: '보통',
  memo: '',
};

export function TestersTab({ test }: TestersTabProps) {
  const { addTester, deleteTester, addToast } = useStore();
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState<Omit<Tester, 'id'>>(emptyForm);

  const handleSubmit = () => {
    if (!form.name.trim()) {
      addToast({ type: 'error', message: '테스터 이름을 입력해주세요.' });
      return;
    }
    addTester(test.id, form);
    setForm(emptyForm);
    setShowDrawer(false);
    addToast({ type: 'success', message: `${form.name} 테스터가 추가되었습니다.` });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-dark text-base">테스터 목록</h3>
          <p className="text-sub text-sm mt-0.5">총 {test.testers.length}명의 테스터가 등록되어 있습니다</p>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
          style={{ backgroundColor: '#09AB49' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          테스터 추가
        </button>
      </div>

      {/* Tester Cards */}
      {test.testers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-outline text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E8F9EF' }}>
            <svg className="w-7 h-7" style={{ color: '#09AB49' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sub text-sm">아직 테스터가 없습니다. 테스터 추가 버튼을 눌러주세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {test.testers.map((tester) => (
            <TesterCard key={tester.id} tester={tester} testId={test.id} />
          ))}
        </div>
      )}

      {/* Slide Drawer */}
      {showDrawer && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(26,26,46,0.3)' }}
            onClick={() => setShowDrawer(false)}
          />
          <div className="fixed right-0 top-0 h-full w-96 bg-white z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-outline">
              <h3 className="font-semibold text-dark">테스터 추가</h3>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-sub hover:text-dark p-1 rounded-lg hover:bg-gray-bg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <FormField label="이름" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="예: 김지수"
                  className="input-base"
                />
              </FormField>

              <FormField label="나이대" required>
                <div className="flex gap-2 flex-wrap">
                  {AGE_GROUPS.map((ag) => (
                    <button
                      key={ag}
                      onClick={() => setForm({ ...form, ageGroup: ag })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        form.ageGroup === ag
                          ? 'border-primary text-primary bg-primary-50'
                          : 'border-gray-outline text-sub hover:border-dark hover:text-dark'
                      }`}
                    >
                      {ag}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="성별" required>
                <div className="flex gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        form.gender === g
                          ? 'border-primary text-primary bg-primary-50'
                          : 'border-gray-outline text-sub hover:border-dark hover:text-dark'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="직업">
                <input
                  type="text"
                  value={form.job}
                  onChange={(e) => setForm({ ...form, job: e.target.value })}
                  placeholder="예: UX 디자이너"
                  className="input-base"
                />
              </FormField>

              <FormField label="디지털 리터러시" required>
                <div className="flex gap-2">
                  {LITERACY.map((l) => (
                    <button
                      key={l}
                      onClick={() => setForm({ ...form, digitalLiteracy: l })}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        form.digitalLiteracy === l
                          ? 'border-primary text-primary bg-primary-50'
                          : 'border-gray-outline text-sub hover:border-dark hover:text-dark'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="특징 메모">
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  placeholder="테스터의 특이사항이나 배경 정보를 자유롭게 기록하세요"
                  rows={3}
                  className="input-base resize-none"
                />
              </FormField>
            </div>

            <div className="px-6 py-5 border-t border-gray-outline">
              <button
                onClick={handleSubmit}
                className="w-full text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: '#09AB49' }}
              >
                추가하기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function TesterCard({ tester, testId }: { tester: Tester; testId: string }) {
  const { deleteTester, addToast } = useStore();

  const initials = tester.name.slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-gray-outline p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: '#09AB49' }}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-dark">{tester.name}</p>
            <p className="text-xs text-sub">{tester.ageGroup} · {tester.gender} · {tester.job || '직업 미기재'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            deleteTester(testId, tester.id);
            addToast({ type: 'info', message: `${tester.name} 테스터가 삭제되었습니다.` });
          }}
          className="text-sub hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:bg-red-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LITERACY_COLORS[tester.digitalLiteracy]}`}>
          {tester.digitalLiteracy}
        </span>
        {tester.result && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RATING_MAP[tester.result.rating].color}`}>
            {RATING_MAP[tester.result.rating].label}
          </span>
        )}
        {tester.result && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary font-medium">
            결과 입력됨 ✓
          </span>
        )}
      </div>

      {tester.memo && (
        <p className="text-xs text-sub mt-3 line-clamp-2">{tester.memo}</p>
      )}
    </div>
  );
}
