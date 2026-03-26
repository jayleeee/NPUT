// 임시 인메모리 저장소 — Supabase 연동 시 아래 store 변수를 Supabase 쿼리로 교체
let store = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 전체 조회
  if (req.method === 'GET') {
    return res.status(200).json(store);
  }

  // 생성 / 업데이트 (upsert)
  if (req.method === 'POST') {
    const test = req.body;
    if (!test?.id) return res.status(400).json({ error: 'id required' });
    store = [test, ...store.filter(t => t.id !== test.id)];
    store.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json(test);
  }

  // 삭제
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'id required' });
    store = store.filter(t => t.id !== id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
