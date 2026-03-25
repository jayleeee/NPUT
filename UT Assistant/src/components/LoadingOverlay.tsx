interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'AI가 분석 중입니다...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(26,26,46,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary-50" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"
          />
          <div className="absolute inset-3 rounded-full flex items-center justify-center" style={{ backgroundColor: '#09AB49' }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-dark">{message}</p>
          <p className="text-sm text-sub mt-0.5">잠시만 기다려주세요</p>
        </div>
      </div>
    </div>
  );
}

interface InlineLoadingProps {
  message?: string;
}

export function InlineLoading({ message = 'AI가 분석 중입니다...' }: InlineLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary-50" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>
      <p className="text-sub text-sm font-medium">{message}</p>
    </div>
  );
}
