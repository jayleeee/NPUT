import { useState } from 'react';
import { useStore } from '../../store';
import { generateInsights } from '../../api/claude';
import { InlineLoading } from '../../components/LoadingOverlay';
import type { Test, Tester } from '../../types';

interface ResultsTabProps {
  test: Test;
}

const RATING_OPTIONS: { value: Tester['result'] extends { rating: infer R } | undefined ? R : never; label: string; emoji: string; color: string }[] = [
  { value: 'good', label: '좋음', emoji: '😊', color: 'border-green-400 bg-green-50 text-green-700' },
  { value: 'neutral', label: '보통', emoji: '😐', color: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
  { value: 'bad', label: '나쁨', emoji: '😞', color: 'border-red-400 bg-red-50 text-red-700' },
];

const CATEGORY_ICONS: Record<string, string> = {
  내비게이션: '🧭',
  CTA: '🎯',
  온보딩: '🚀',
  폼: '📝',
  피드백: '💬',
  모달: '🪟',
  정보구조: '🗂️',
  시각디자인: '🎨',
  인터랙션: '👆',
};

export function ResultsTab({ test }: ResultsTabProps) {
  const { updateTester, updateTest, apiKey, addToast } = useStore();
  const [selectedTesterId, setSelectedTesterId] = useState<string>(
    test.testers[0]?.id || ''
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedTester = test.testers.find((t) => t.id === selectedTesterId);
  const allResultsDone =
    test.testers.length > 0 &&
    test.testers.every((t) => t.result);

  const handleRatingChange = (rating: 'good' | 'neutral' | 'bad') => {
    if (!selectedTester) return;
    updateTester(test.id, selectedTesterId, {
      result: {
        notes: selectedTester.result?.notes || '',
        rating,
      },
    });
  };

  const handleNotesChange = (notes: string) => {
    if (!selectedTester) return;
    updateTester(test.id, selectedTesterId, {
      result: {
        rating: selectedTester.result?.rating || 'neutral',
        notes,
      },
    });
  };

  const handleGenerateInsights = async () => {
    if (!apiKey) {
      addToast({ type: 'error', message: 'API 키를 먼저 설정해주세요.' });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateInsights(apiKey, test.purpose, test.testers);
      updateTest(test.id, { insights: result, status: 'completed' });
      addToast({ type: 'success', message: 'AI 인사이트가 생성되었습니다.' });
    } catch (e: any) {
      addToast({ type: 'error', message: `오류: ${e.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  if (test.testers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-outline text-center py-20">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E8F9EF' }}>
          <svg className="w-7 h-7" style={{ color: '#09AB49' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sub text-sm">테스터 탭에서 먼저 테스터를 등록해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-5">
        {/* Tester List */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-outline overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-outline">
              <p className="text-xs font-semibold text-sub uppercase tracking-wide">테스터</p>
            </div>
            <div className="divide-y divide-gray-outline">
              {test.testers.map((tester) => (
                <button
                  key={tester.id}
                  onClick={() => setSelectedTesterId(tester.id)}
                  className={`w-full text-left px-4 py-3 transition-all ${
                    selectedTesterId === tester.id
                      ? 'bg-primary-50'
                      : 'hover:bg-gray-bg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium truncate ${
                        selectedTesterId === tester.id ? 'text-primary' : 'text-dark'
                      }`}
                    >
                      {tester.name}
                    </span>
                    {tester.result && (
                      <svg className="w-4 h-4 text-primary flex-shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-sub mt-0.5">{tester.ageGroup}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Form */}
        <div className="flex-1">
          {selectedTester ? (
            <div className="bg-white rounded-2xl border border-gray-outline p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-outline">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ backgroundColor: '#09AB49' }}
                >
                  {selectedTester.name.slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-dark">{selectedTester.name}</p>
                  <p className="text-xs text-sub">
                    {selectedTester.ageGroup} · {selectedTester.gender} · {selectedTester.digitalLiteracy} 리터러시
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-dark mb-3">전반적인 평가</label>
                <div className="flex gap-3">
                  {RATING_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleRatingChange(opt.value)}
                      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all font-medium text-sm ${
                        selectedTester.result?.rating === opt.value
                          ? opt.color
                          : 'border-gray-outline text-sub hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">메모</label>
                <p className="text-xs text-sub mb-2">발화 기록, 관찰 내용, 특이사항 등을 자유롭게 기록하세요</p>
                <textarea
                  value={selectedTester.result?.notes || ''}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder={`예) "버튼이 어디 있는지 모르겠어요" — 검색 버튼 찾는 데 40초 소요. 필터 섹션에서 혼란 보임...`}
                  rows={8}
                  className="w-full border border-gray-outline rounded-xl px-4 py-3 text-sm text-dark placeholder-sub focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-sub">
                  {test.testers.filter((t) => t.result).length}/{test.testers.length}명 입력 완료
                </p>
                {selectedTester.result && (
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    저장됨
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-white rounded-2xl border border-gray-outline p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-dark">AI 인사이트 분석</h3>
            <p className="text-sub text-sm mt-0.5">
              {allResultsDone
                ? '모든 테스터 결과가 입력되었습니다. AI 분석을 진행하세요.'
                : `${test.testers.filter((t) => t.result).length}/${test.testers.length}명 결과 입력 완료 후 분석 가능합니다.`}
            </p>
          </div>
          <button
            onClick={handleGenerateInsights}
            disabled={!allResultsDone || isGenerating}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            style={{ backgroundColor: '#09AB49' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {test.insights ? 'AI 재분석' : 'AI 인사이트 생성'}
          </button>
        </div>

        {isGenerating ? (
          <InlineLoading message="AI가 테스트 결과를 분석 중입니다..." />
        ) : test.insights ? (
          <div className="space-y-6">
            {/* Task Insights */}
            <div>
              <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
                과제 수준 인사이트
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {test.insights.taskInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>

            {/* UX Insights */}
            <div>
              <h4 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">2</span>
                UX 인사이트 (재사용 가능)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {test.insights.uxInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} variant="ux" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sub text-sm">인사이트가 아직 생성되지 않았습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InsightCard({
  insight,
  variant = 'task',
}: {
  insight: { id: string; title: string; content: string; evidence: string; category: string };
  variant?: 'task' | 'ux';
}) {
  const icon = CATEGORY_ICONS[insight.category] || '💡';
  const borderColor = variant === 'ux' ? 'border-purple-100' : 'border-blue-100';
  const bgColor = variant === 'ux' ? 'bg-purple-50' : 'bg-blue-50';
  const textColor = variant === 'ux' ? 'text-purple-700' : 'text-blue-700';

  return (
    <div className={`border rounded-xl p-4 ${borderColor}`}>
      <div className="flex items-start gap-2 mb-2">
        <span className="text-lg flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-dark text-sm">{insight.title}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${bgColor} ${textColor}`}>
              {insight.category}
            </span>
          </div>
          <p className="text-sm text-dark leading-relaxed">{insight.content}</p>
        </div>
      </div>
      {insight.evidence && (
        <div className="mt-3 pl-2 border-l-2 border-gray-outline">
          <p className="text-xs text-sub italic">"{insight.evidence}"</p>
        </div>
      )}
    </div>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  내비게이션: '🧭',
  CTA: '🎯',
  온보딩: '🚀',
  폼: '📝',
  피드백: '💬',
  모달: '🪟',
  정보구조: '🗂️',
  시각디자인: '🎨',
  인터랙션: '👆',
};
