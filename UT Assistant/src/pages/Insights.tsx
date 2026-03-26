import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Layout } from '../components/Layout';

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

const ALL_CATEGORIES = Object.keys(CATEGORY_ICONS);

interface FlatInsight {
  id: string;
  title: string;
  content: string;
  evidence: string;
  category: string;
  testId: string;
  testName: string;
  testDate: string;
  type: 'task' | 'ux';
}

export function Insights() {
  const { tests } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const allInsights = useMemo<FlatInsight[]>(() => {
    const result: FlatInsight[] = [];
    tests.forEach((test) => {
      if (!test.insights) return;
      test.insights.taskInsights.forEach((insight) => {
        result.push({
          ...insight,
          testId: test.id,
          testName: test.name,
          testDate: test.createdAt,
          type: 'task',
        });
      });
      test.insights.uxInsights.forEach((insight) => {
        result.push({
          ...insight,
          testId: test.id,
          testName: test.name,
          testDate: test.createdAt,
          type: 'ux',
        });
      });
    });
    return result.sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
  }, [tests]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allInsights.forEach((ins) => {
      counts[ins.category] = (counts[ins.category] || 0) + 1;
    });
    return counts;
  }, [allInsights]);

  const filteredInsights = useMemo(() => {
    return allInsights.filter((ins) => {
      const matchesSearch =
        !searchQuery ||
        ins.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.evidence.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(ins.category);
      return matchesSearch && matchesCategory;
    });
  }, [allInsights, searchQuery, selectedCategories]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark">UX 인사이트 아카이브</h1>
          <p className="text-sub text-sm mt-0.5">모든 테스트에서 수집된 인사이트를 한눈에 확인하세요</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          <div className="bg-white rounded-2xl border border-gray-outline p-5">
            <p className="text-sub text-sm mb-1">전체 인사이트</p>
            <p className="text-3xl font-bold text-dark">{allInsights.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-outline p-5">
            <p className="text-sub text-sm mb-1">UX 인사이트</p>
            <p className="text-3xl font-bold" style={{ color: '#09AB49' }}>
              {allInsights.filter((i) => i.type === 'ux').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-outline p-5">
            <p className="text-sub text-sm mb-1">분석 완료 테스트</p>
            <p className="text-3xl font-bold text-dark">
              {tests.filter((t) => t.insights).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-outline p-5 mb-6">
          {/* Search */}
          <div className="relative mb-4">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sub"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="인사이트 검색..."
              className="w-full border border-gray-outline rounded-xl pl-10 pr-4 py-2.5 text-sm text-dark placeholder-sub focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategories([])}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedCategories.length === 0
                  ? 'border-primary bg-primary-50 text-primary'
                  : 'border-gray-outline text-sub hover:border-dark hover:text-dark'
              }`}
            >
              전체
            </button>
            {ALL_CATEGORIES.filter((cat) => categoryCounts[cat]).map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  selectedCategories.includes(cat)
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-gray-outline text-sub hover:border-dark hover:text-dark'
                }`}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                {cat}
                <span className="text-xs opacity-60">({categoryCounts[cat] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Insights Grid */}
        {allInsights.length === 0 ? (
          <EmptyInsights />
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sub text-sm">검색 조건에 맞는 인사이트가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredInsights.map((insight) => (
              <InsightCard
                key={`${insight.testId}-${insight.id}`}
                insight={insight}
                onClick={() => navigate(`/test/${insight.testId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function InsightCard({
  insight,
  onClick,
}: {
  insight: FlatInsight;
  onClick: () => void;
}) {
  const icon = CATEGORY_ICONS[insight.category] || '💡';
  const isUX = insight.type === 'ux';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-outline p-5 cursor-pointer hover:shadow-md hover:border-primary transition-all group"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <p className="font-semibold text-dark text-sm group-hover:text-primary transition-colors">
              {insight.title}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isUX ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isUX ? 'UX 인사이트' : '과제 인사이트'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-bg text-sub font-medium">
              {insight.category}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-dark leading-relaxed mb-3 line-clamp-3">{insight.content}</p>

      {insight.evidence && (
        <div className="pl-2 border-l-2 border-gray-outline mb-3">
          <p className="text-xs text-sub italic line-clamp-2">"{insight.evidence}"</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-outline">
        <span className="text-xs text-sub truncate mr-2">{insight.testName}</span>
        <span className="text-xs text-sub flex-shrink-0">
          {new Date(insight.testDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

function EmptyInsights() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 mx-auto" style={{ backgroundColor: '#E8F9EF' }}>
        <svg className="w-12 h-12" style={{ color: '#09AB49' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-dark mb-2">아직 인사이트가 없어요</h3>
      <p className="text-sub text-sm max-w-xs">
        테스트를 완료하고 AI 인사이트를 생성하면 이 곳에 자동으로 모입니다.
      </p>
    </div>
  );
}
