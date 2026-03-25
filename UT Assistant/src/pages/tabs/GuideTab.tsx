import { useState } from 'react';
import { useStore } from '../../store';
import { generateGuide, generateScenarios } from '../../api/claude';
import { InlineLoading } from '../../components/LoadingOverlay';
import type { Test, Scenario } from '../../types';

const generateId = () => Math.random().toString(36).slice(2, 11);

interface GuideTabProps {
  test: Test;
}

export function GuideTab({ test }: GuideTabProps) {
  const { updateTest, apiKey, addToast } = useStore();
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  const [guide, setGuide] = useState(test.guide);
  const [scenarios, setScenarios] = useState<Scenario[]>(test.scenarios || []);
  const [editingScenario, setEditingScenario] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleGenerateGuide = async () => {
    if (!apiKey) {
      addToast({ type: 'error', message: 'API 키를 먼저 설정해주세요. (사이드바 하단)' });
      return;
    }
    setIsGeneratingGuide(true);
    try {
      const result = await generateGuide(apiKey, test.purpose, test.images);
      setGuide(result);
      updateTest(test.id, { guide: result });
      addToast({ type: 'success', message: 'AI 가이드가 생성되었습니다.' });
    } catch (e: any) {
      addToast({ type: 'error', message: `오류: ${e.message}` });
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const handleSaveGuide = () => {
    updateTest(test.id, { guide });
    addToast({ type: 'success', message: '가이드가 저장되었습니다.' });
  };

  const handleGenerateScenarios = async () => {
    if (!apiKey) {
      addToast({ type: 'error', message: 'API 키를 먼저 설정해주세요.' });
      return;
    }
    setIsGeneratingScenarios(true);
    try {
      const result = await generateScenarios(apiKey, test.purpose, test.images);
      const newScenarios: Scenario[] = result.map((content, i) => ({
        id: generateId(),
        order: i + 1,
        content,
      }));
      setScenarios(newScenarios);
      updateTest(test.id, { scenarios: newScenarios });
      addToast({ type: 'success', message: 'AI 시나리오 초안이 생성되었습니다.' });
    } catch (e: any) {
      addToast({ type: 'error', message: `오류: ${e.message}` });
    } finally {
      setIsGeneratingScenarios(false);
    }
  };

  const handleAddScenario = () => {
    const newS: Scenario = {
      id: generateId(),
      order: scenarios.length + 1,
      content: '새 시나리오를 작성해주세요.',
    };
    const updated = [...scenarios, newS];
    setScenarios(updated);
    updateTest(test.id, { scenarios: updated });
    setEditingScenario(newS.id);
    setEditContent(newS.content);
  };

  const handleDeleteScenario = (id: string) => {
    const updated = scenarios
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order: i + 1 }));
    setScenarios(updated);
    updateTest(test.id, { scenarios: updated });
  };

  const handleSaveScenario = (id: string) => {
    const updated = scenarios.map((s) =>
      s.id === id ? { ...s, content: editContent } : s
    );
    setScenarios(updated);
    updateTest(test.id, { scenarios: updated });
    setEditingScenario(null);
  };

  return (
    <div className="space-y-6">
      {/* Guide Section */}
      <div className="bg-white rounded-2xl border border-gray-outline p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-dark text-base">진행 가이드</h3>
            <p className="text-sub text-sm mt-0.5">UT 진행 시 사용할 오프닝 / 질문 / 클로징 스크립트</p>
          </div>
          <button
            onClick={handleGenerateGuide}
            disabled={isGeneratingGuide}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
            style={{ backgroundColor: '#09AB49' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {guide ? 'AI 재생성' : 'AI 가이드 생성'}
          </button>
        </div>

        {isGeneratingGuide ? (
          <InlineLoading message="AI가 가이드를 작성 중입니다..." />
        ) : guide ? (
          <div className="space-y-5">
            {/* Opening */}
            <div>
              <label className="block text-xs font-semibold text-sub uppercase tracking-wide mb-2">오프닝 멘트</label>
              <textarea
                value={guide.opening}
                onChange={(e) => setGuide({ ...guide, opening: e.target.value })}
                rows={3}
                className="w-full border border-gray-outline rounded-xl px-4 py-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Questions */}
            <div>
              <label className="block text-xs font-semibold text-sub uppercase tracking-wide mb-2">
                단계별 질문 ({guide.questions.length}개)
              </label>
              <div className="space-y-2">
                {guide.questions.map((q, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 text-primary text-xs font-bold flex items-center justify-center mt-2.5">
                      {i + 1}
                    </span>
                    <textarea
                      value={q}
                      onChange={(e) => {
                        const qs = [...guide.questions];
                        qs[i] = e.target.value;
                        setGuide({ ...guide, questions: qs });
                      }}
                      rows={2}
                      className="flex-1 border border-gray-outline rounded-xl px-4 py-2.5 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                    <button
                      onClick={() => {
                        const qs = guide.questions.filter((_, idx) => idx !== i);
                        setGuide({ ...guide, questions: qs });
                      }}
                      className="text-sub hover:text-red-500 transition-colors mt-2.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setGuide({ ...guide, questions: [...guide.questions, ''] })}
                  className="flex items-center gap-1 text-primary text-sm font-medium hover:opacity-70 transition-opacity ml-8"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  질문 추가
                </button>
              </div>
            </div>

            {/* Closing */}
            <div>
              <label className="block text-xs font-semibold text-sub uppercase tracking-wide mb-2">클로징 멘트</label>
              <textarea
                value={guide.closing}
                onChange={(e) => setGuide({ ...guide, closing: e.target.value })}
                rows={2}
                className="w-full border border-gray-outline rounded-xl px-4 py-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveGuide}
                className="px-5 py-2 border border-gray-outline text-dark rounded-xl text-sm font-medium hover:bg-gray-bg transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E8F9EF' }}>
              <svg className="w-7 h-7" style={{ color: '#09AB49' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sub text-sm">AI 가이드 생성 버튼을 눌러 진행 스크립트를 자동으로 만들어보세요.</p>
          </div>
        )}
      </div>

      {/* Scenario Builder */}
      <div className="bg-white rounded-2xl border border-gray-outline p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-dark text-base">태스크 시나리오</h3>
            <p className="text-sub text-sm mt-0.5">테스터에게 제시할 단계별 과제를 구성하세요</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateScenarios}
              disabled={isGeneratingScenarios}
              className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-xl text-sm font-medium hover:bg-primary-50 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 초안 생성
            </button>
            <button
              onClick={handleAddScenario}
              className="flex items-center gap-2 px-4 py-2 border border-gray-outline text-dark rounded-xl text-sm font-medium hover:bg-gray-bg transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              직접 추가
            </button>
          </div>
        </div>

        {isGeneratingScenarios ? (
          <InlineLoading message="AI가 시나리오를 작성 중입니다..." />
        ) : scenarios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sub text-sm">시나리오가 없습니다. AI 초안 생성 또는 직접 추가 버튼을 눌러주세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scenarios.map((s) => (
              <div
                key={s.id}
                className="border border-gray-outline rounded-xl p-4 group"
              >
                {editingScenario === s.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full border border-primary rounded-xl px-4 py-2.5 text-sm text-dark focus:outline-none resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveScenario(s.id)}
                        className="px-4 py-1.5 text-white rounded-lg text-xs font-medium"
                        style={{ backgroundColor: '#09AB49' }}
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingScenario(null)}
                        className="px-4 py-1.5 border border-gray-outline text-sub rounded-lg text-xs font-medium hover:bg-gray-bg"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center"
                      style={{ backgroundColor: '#09AB49' }}
                    >
                      {s.order}
                    </span>
                    <p className="text-sm text-dark flex-1 leading-relaxed pt-0.5">{s.content}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingScenario(s.id); setEditContent(s.content); }}
                        className="p-1.5 text-sub hover:text-dark hover:bg-gray-bg rounded-lg transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteScenario(s.id)}
                        className="p-1.5 text-sub hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
