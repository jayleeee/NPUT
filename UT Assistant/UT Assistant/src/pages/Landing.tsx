import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export function Landing() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 400));

    const success = login(code);
    setIsLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('인증번호가 올바르지 않습니다.');
      setCode('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-bg flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#09AB49' }}
          >
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-dark">UT Assistant</h1>
        </div>
        <p className="text-sub text-base">AI와 함께하는 사용자 테스트 전 과정 관리</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-outline p-8">
        <h2 className="text-xl font-semibold text-dark mb-1">인증번호를 입력하세요</h2>
        <p className="text-sm text-sub mb-6">팀에서 공유받은 인증번호를 입력해주세요.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="인증번호 입력"
              className="w-full border border-gray-outline rounded-xl px-4 py-3 text-sm text-dark placeholder-sub focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !code}
            className="w-full text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: '#09AB49' }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                확인 중...
              </>
            ) : (
              '입력하기'
            )}
          </button>
        </form>
      </div>

      {/* Features */}
      <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm w-full">
        {[
          { icon: '🧭', label: 'AI 가이드 생성' },
          { icon: '📊', label: '인사이트 분석' },
          { icon: '✏️', label: '개선안 어노테이션' },
        ].map((f) => (
          <div key={f.label} className="text-center">
            <div className="text-2xl mb-1">{f.icon}</div>
            <p className="text-xs text-sub">{f.label}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-sub">
        © 2024 UT Assistant · Powered by Claude AI
      </p>
    </div>
  );
}
