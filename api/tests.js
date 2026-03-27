const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const sbHeaders = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 환경변수 누락 체크
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars');
    return res.status(500).json({ error: 'Server misconfigured: missing env vars' });
  }

  // 전체 조회
  if (req.method === 'GET') {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/tests?select=data&order=created_at.desc`,
      { headers: sbHeaders }
    );
    const rows = await r.json();
    if (!r.ok) {
      console.error('Supabase GET error:', rows);
      return res.status(r.status).json({ error: rows });
    }
    if (!Array.isArray(rows)) {
      console.error('Supabase GET unexpected response:', rows);
      return res.status(500).json({ error: 'Unexpected response from Supabase' });
    }
    return res.status(200).json(rows.map(row => row.data));
  }

  // 생성 / 업데이트 (upsert)
  if (req.method === 'POST') {
    const test = req.body;
    if (!test?.id) return res.status(400).json({ error: 'id required' });
    const r = await fetch(`${SUPABASE_URL}/rest/v1/tests`, {
      method: 'POST',
      headers: {
        ...sbHeaders,
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({ id: test.id, data: test, created_at: test.createdAt }),
    });
    const result = await r.json();
    if (!r.ok) {
      console.error('Supabase POST error:', result);
      return res.status(r.status).json({ error: result });
    }
    return res.status(200).json(result[0]?.data || test);
  }

  // 삭제
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'id required' });
    const r = await fetch(`${SUPABASE_URL}/rest/v1/tests?id=eq.${id}`, {
      method: 'DELETE',
      headers: sbHeaders,
    });
    if (!r.ok) {
      const err = await r.json();
      console.error('Supabase DELETE error:', err);
      return res.status(r.status).json({ error: err });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
