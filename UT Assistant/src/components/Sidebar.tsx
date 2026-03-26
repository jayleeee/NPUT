import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../store';
import { Modal } from './Modal';

export function Sidebar() {
  const { logout, apiKey, setApiKey, addToast } = useStore();
  const navigate = useNavigate();
  const [showApiModal, setShowApiModal] = useState(!apiKey);
  const [apiInput, setApiInput] = useState(apiKey || '');

  const handleSaveApiKey = () => {
    if (!apiInput.trim()) {
      addToast({ type: 'error', message: 'API 키를 입력해주세요.' });
      return;
    }
    setApiKey(apiInput.trim());
    setShowApiModal(false);
    addToast({ type: 'success', message: 'API 키가 저장되었습니다.' });
  };

  const navItems = [
    {
      to: '/dashboard',
      label: '대시보드',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      to: '/insights',
      label: 'UX 인사이트',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <aside className="w-60 bg-white border-r border-gray-outline flex flex-col h-screen fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-outline">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#09AB49' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="font-bold text-dark text-base">UT Assistant</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ${
                  isActive
                    ? 'text-primary bg-primary-50'
                    : 'text-sub hover:text-dark hover:bg-gray-bg'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-gray-outline space-y-1">
          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sub hover:text-dark hover:bg-gray-bg w-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>API 키 설정</span>
            {apiKey && (
              <span className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sub hover:text-red-500 hover:bg-red-50 w-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            로그아웃
          </button>
        </div>
      </aside>

      {/* API Key Modal */}
      <Modal
        isOpen={showApiModal}
        onClose={() => apiKey ? setShowApiModal(false) : undefined}
        title="Claude API 키 설정"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-sub">
            AI 기능을 사용하려면 Anthropic API 키가 필요합니다. 키는 로컬에만 저장되며 외부로 전송되지 않습니다.
          </p>
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">API 키</label>
            <input
              type="password"
              value={apiInput}
              onChange={(e) => setApiInput(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full border border-gray-outline rounded-xl px-3 py-2.5 text-sm text-dark placeholder-sub focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
            />
          </div>
          <div className="flex gap-2 pt-2">
            {apiKey && (
              <button
                onClick={() => setShowApiModal(false)}
                className="flex-1 border border-gray-outline text-sub rounded-xl py-2.5 text-sm font-medium hover:bg-gray-bg transition-colors"
              >
                취소
              </button>
            )}
            <button
              onClick={handleSaveApiKey}
              className="flex-1 text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#09AB49' }}
            >
              저장
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
