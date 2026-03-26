import { useState } from 'react';
import { useStore } from '../../store';
import { generateAnnotations } from '../../api/claude';
import { InlineLoading } from '../../components/LoadingOverlay';
import type { Test, AnnotationPoint, ImageAnnotation } from '../../types';

interface AnnotationsTabProps {
  test: Test;
}

export function AnnotationsTab({ test }: AnnotationsTabProps) {
  const { updateTest, apiKey, addToast } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);

  const currentAnnotation = test.annotations?.find(
    (a) => a.imageIndex === selectedImageIndex
  );

  const allInsights = test.insights
    ? [...test.insights.taskInsights, ...test.insights.uxInsights]
    : [];

  const handleGenerate = async () => {
    if (!apiKey) {
      addToast({ type: 'error', message: 'API 키를 먼저 설정해주세요.' });
      return;
    }
    if (!test.insights) {
      addToast({ type: 'error', message: '먼저 결과 탭에서 AI 인사이트를 생성해주세요.' });
      return;
    }
    if (test.images.length === 0) {
      addToast({ type: 'error', message: '테스트에 화면 이미지가 없습니다.' });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAnnotations(
        apiKey,
        test.images[selectedImageIndex],
        allInsights
      );

      const newAnnotation: ImageAnnotation = {
        imageIndex: selectedImageIndex,
        points: result.map((r, i) => ({
          id: `ann-${i}`,
          number: r.number,
          title: r.title,
          content: r.content,
          position: r.position,
        })),
      };

      const updatedAnnotations = [
        ...(test.annotations || []).filter((a) => a.imageIndex !== selectedImageIndex),
        newAnnotation,
      ];

      updateTest(test.id, { annotations: updatedAnnotations });
      addToast({ type: 'success', message: '어노테이션이 생성되었습니다.' });
    } catch (e: any) {
      addToast({ type: 'error', message: `오류: ${e.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  if (test.images.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-outline text-center py-20">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E8F9EF' }}>
          <svg className="w-7 h-7" style={{ color: '#09AB49' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sub text-sm">화면 이미지가 없습니다. 대시보드에서 이미지를 추가해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-outline p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-dark">AI 개선 어노테이션</h3>
            <p className="text-sub text-sm mt-0.5">
              {!test.insights
                ? '결과 탭에서 AI 인사이트를 먼저 생성해야 합니다.'
                : '이미지를 선택하고 어노테이션을 생성하세요.'}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !test.insights}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#09AB49' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 어노테이션 생성
          </button>
        </div>

        {/* Image Tabs */}
        {test.images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {test.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImageIndex(i)}
                className={`flex-shrink-0 relative rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImageIndex === i
                    ? 'border-primary'
                    : 'border-gray-outline hover:border-gray-300'
                }`}
              >
                <img src={img} alt={`화면 ${i + 1}`} className="w-20 h-14 object-cover" />
                {test.annotations?.some((a) => a.imageIndex === i) && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      {isGenerating ? (
        <InlineLoading message="AI가 개선 포인트를 분석 중입니다..." />
      ) : (
        <div className="flex gap-5">
          {/* Image with Pins */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-outline overflow-hidden">
              <div className="relative">
                <img
                  src={test.images[selectedImageIndex]}
                  alt="화면"
                  className="w-full object-contain max-h-[600px]"
                />
                {currentAnnotation?.points.map((pin) => (
                  <AnnotationPin
                    key={pin.id}
                    pin={pin}
                    isHovered={hoveredPin === pin.number}
                    onHover={setHoveredPin}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Annotations List */}
          {currentAnnotation && currentAnnotation.points.length > 0 && (
            <div className="w-80 flex-shrink-0 space-y-3">
              <h4 className="text-sm font-semibold text-dark px-1">개선 포인트</h4>
              {currentAnnotation.points.map((point) => (
                <div
                  key={point.id}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                    hoveredPin === point.number
                      ? 'border-primary shadow-md'
                      : 'border-gray-outline hover:border-gray-300'
                  }`}
                  onMouseEnter={() => setHoveredPin(point.number)}
                  onMouseLeave={() => setHoveredPin(null)}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                      style={{ backgroundColor: '#09AB49' }}
                    >
                      {point.number}
                    </span>
                    <div>
                      <p className="font-semibold text-dark text-sm mb-1">{point.title}</p>
                      <p className="text-sub text-xs leading-relaxed">{point.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!currentAnnotation && (
            <div className="w-80 flex-shrink-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#E8F9EF' }}>
                  <svg className="w-6 h-6" style={{ color: '#09AB49' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <p className="text-sub text-sm">이 화면의 어노테이션이 없습니다.</p>
                <p className="text-sub text-xs mt-1">AI 어노테이션 생성 버튼을 눌러주세요.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnnotationPin({
  pin,
  isHovered,
  onHover,
}: {
  pin: AnnotationPoint;
  isHovered: boolean;
  onHover: (n: number | null) => void;
}) {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
      style={{ left: `${pin.position.x}%`, top: `${pin.position.y}%` }}
      onMouseEnter={() => onHover(pin.number)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white transition-transform ${
          isHovered ? 'scale-125' : ''
        }`}
        style={{ backgroundColor: '#09AB49' }}
      >
        {pin.number}
      </div>
      {isHovered && (
        <div className="absolute left-8 top-0 w-56 bg-white rounded-xl shadow-xl border border-gray-outline p-3 z-20">
          <p className="font-semibold text-dark text-xs mb-1">{pin.title}</p>
          <p className="text-sub text-xs leading-relaxed">{pin.content}</p>
        </div>
      )}
    </div>
  );
}
