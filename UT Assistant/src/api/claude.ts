import type { Tester, Insight } from '../types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-3-5-sonnet-20241022';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ClaudeContent[];
}

interface ClaudeContent {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  messages: ClaudeMessage[]
): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `API 오류: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function base64ToMediaType(base64: string): string {
  const header = base64.split(',')[0];
  if (header.includes('png')) return 'image/png';
  if (header.includes('jpg') || header.includes('jpeg')) return 'image/jpeg';
  if (header.includes('gif')) return 'image/gif';
  if (header.includes('webp')) return 'image/webp';
  return 'image/jpeg';
}

function stripBase64Header(base64: string): string {
  return base64.includes(',') ? base64.split(',')[1] : base64;
}

// F2 — AI 테스트 가이드 생성
export async function generateGuide(
  apiKey: string,
  purpose: string,
  images: string[]
): Promise<{ opening: string; questions: string[]; closing: string }> {
  const system = `당신은 10년 경력의 UX 리서치 전문가입니다. 주어진 테스트 목적과 화면 이미지를 분석해서 전문적인 UT 진행 가이드를 작성하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "opening": "오프닝 멘트 (참가자를 편안하게 해주는 인사 및 테스트 목적 설명, 3-5문장)",
  "questions": [
    "질문1",
    "질문2",
    "질문3",
    "질문4",
    "질문5",
    "질문6",
    "질문7"
  ],
  "closing": "클로징 멘트 (감사 인사 및 마무리, 2-3문장)"
}

질문은 최소 5개 이상 작성하고, 개방형 질문 위주로 작성하세요. JSON 외 다른 텍스트는 절대 포함하지 마세요.`;

  const userContent: ClaudeContent[] = [
    {
      type: 'text',
      text: `테스트 목적: ${purpose}\n\n위 목적과 아래 화면 이미지들을 바탕으로 UT 진행 가이드를 작성해주세요.`,
    },
    ...images.map((img) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: base64ToMediaType(img),
        data: stripBase64Header(img),
      },
    })),
  ];

  const text = await callClaude(apiKey, system, [
    { role: 'user', content: userContent },
  ]);

  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// N1 — AI 시나리오 초안 생성
export async function generateScenarios(
  apiKey: string,
  purpose: string,
  images: string[]
): Promise<string[]> {
  const system = `당신은 UX 리서치 전문가입니다. 테스트 목적을 바탕으로 테스터에게 줄 태스크 시나리오를 작성하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "scenarios": [
    "시나리오1: 구체적인 과제 내용",
    "시나리오2: 구체적인 과제 내용",
    "시나리오3: 구체적인 과제 내용",
    "시나리오4: 구체적인 과제 내용",
    "시나리오5: 구체적인 과제 내용"
  ]
}

각 시나리오는 현실적이고 자연스러운 상황 맥락을 포함하고, 테스터가 스스로 탐색하도록 유도해야 합니다. JSON 외 다른 텍스트는 절대 포함하지 마세요.`;

  const userContent: ClaudeContent[] = [
    {
      type: 'text',
      text: `테스트 목적: ${purpose}\n\n위 목적과 화면 이미지를 바탕으로 태스크 시나리오 3~5개를 작성해주세요.`,
    },
    ...images.slice(0, 3).map((img) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: base64ToMediaType(img),
        data: stripBase64Header(img),
      },
    })),
  ];

  const text = await callClaude(apiKey, system, [
    { role: 'user', content: userContent },
  ]);

  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return parsed.scenarios;
}

// F4 — AI 인사이트 생성
export async function generateInsights(
  apiKey: string,
  purpose: string,
  testers: Tester[]
): Promise<{ taskInsights: Insight[]; uxInsights: Insight[] }> {
  const system = `당신은 UX 리서치 전문가입니다. 사용자 테스트 결과를 분석해서 두 가지 레이어의 인사이트를 도출하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "taskInsights": [
    {
      "id": "t1",
      "title": "인사이트 제목",
      "content": "구체적인 분석 내용",
      "evidence": "테스터 발화 또는 관찰 인용구",
      "category": "카테고리"
    }
  ],
  "uxInsights": [
    {
      "id": "u1",
      "title": "UX 원칙/패턴 제목",
      "content": "재사용 가능한 UX 원칙 내용",
      "evidence": "근거 인용구",
      "category": "카테고리"
    }
  ]
}

taskInsights: 이 화면/플로우의 구체적인 문제점과 패턴 (3-5개)
uxInsights: 이 테스트를 넘어 재사용 가능한 UX 원칙/패턴 (2-4개)
카테고리는 다음 중 하나: 내비게이션, CTA, 온보딩, 폼, 피드백, 모달, 정보구조, 시각디자인, 인터랙션
JSON 외 다른 텍스트는 절대 포함하지 마세요.`;

  const resultsText = testers
    .filter((t) => t.result)
    .map(
      (t) =>
        `[${t.name} (${t.ageGroup}, ${t.job}, 디지털리터러시: ${t.digitalLiteracy})]
평가: ${t.result?.rating === 'good' ? '좋음' : t.result?.rating === 'neutral' ? '보통' : '나쁨'}
메모: ${t.result?.notes}`
    )
    .join('\n\n');

  const text = await callClaude(apiKey, system, [
    {
      role: 'user',
      content: `테스트 목적: ${purpose}\n\n테스터 결과:\n${resultsText}\n\n위 결과를 분석해서 인사이트를 도출해주세요.`,
    },
  ]);

  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// F5 — AI 개선 어노테이션 생성
export async function generateAnnotations(
  apiKey: string,
  image: string,
  insights: Insight[]
): Promise<Array<{ number: number; title: string; content: string; position: { x: number; y: number } }>> {
  const system = `당신은 UX 디자인 전문가입니다. 화면 이미지와 UX 인사이트를 바탕으로 구체적인 개선 포인트를 어노테이션으로 작성하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "annotations": [
    {
      "number": 1,
      "title": "개선 포인트 제목",
      "content": "구체적인 개선 방안 설명",
      "position": { "x": 50, "y": 30 }
    }
  ]
}

position은 이미지 내 해당 UI 요소의 대략적인 위치를 퍼센트(0-100)로 표현하세요.
개선 포인트는 3-6개 작성하세요.
JSON 외 다른 텍스트는 절대 포함하지 마세요.`;

  const insightText = insights
    .map((i) => `- ${i.title}: ${i.content}`)
    .join('\n');

  const userContent: ClaudeContent[] = [
    {
      type: 'text',
      text: `다음 UX 인사이트를 바탕으로 이 화면의 개선 어노테이션을 작성해주세요:\n\n${insightText}`,
    },
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: base64ToMediaType(image),
        data: stripBase64Header(image),
      },
    },
  ];

  const text = await callClaude(apiKey, system, [
    { role: 'user', content: userContent },
  ]);

  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return parsed.annotations;
}
