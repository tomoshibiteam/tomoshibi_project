'use client';

import { useState } from 'react';

// ============================================================
// ✏️ フォーム設定 — ここを編集するだけで内容を変更できます
// ============================================================
const FORM_CONFIG = {
  title: 'TOMOSHIBI アンケート',
  subtitle: '興味を持っていただきありがとうございます。\nあなたの声をもとに、より心地よい体験をつくっていきたいです。',
  timeEstimate: '30秒で回答できます',
  submitLabel: 'アンケートを送信する',
  submitNote: 'ご回答ありがとうございます。所要時間は約30秒です。',
  questions: [
    {
      id: 'q1',
      type: 'radio' as const,
      label: 'Q1. TOOMOSHIBIにどのくらい興味がありますか？',
      options: ['とても興味がある', 'やや興味がある', 'どちらともいえない', 'あまり興味がない', 'まだわからない'],
    },
    {
      id: 'q2',
      type: 'checkbox' as const,
      label: 'Q2. どんな場面で使ってみたいですか？（複数選択可）',
      options: ['カフェ巡り', '街歩き', '一人旅', '散歩', 'その日の振り返り'],
    },
    {
      id: 'q3',
      type: 'checkbox' as const,
      label: 'Q3. 魅力に感じたポイントを教えてください（複数選択可）',
      options: ['感動をその場で共有できる', '自分のことを覚えてくれる', 'また一緒に出かけたくなる', '雰囲気が心地いい'],
    },
    {
      id: 'q4',
      type: 'radio' as const,
      label: 'Q4. β版テストに興味はありますか？',
      options: ['参加してみたい', '内容次第で検討したい', '今回は回答のみ'],
    },
    {
      id: 'q5',
      type: 'textarea' as const,
      label: 'Q5. ひとことあれば教えてください（任意）',
      placeholder: '気になったこと、使ってみたい場面など…',
      optional: true,
    },
    {
      id: 'contact',
      type: 'email' as const,
      label: '連絡先（任意）',
      placeholder: 'example@email.com',
      hint: 'ご記入いただくと、β版テストのご案内などをお届けする場合があります。',
      optional: true,
    },
  ],
} as const;

// ============================================================

type Answers = Record<string, string | string[]>;

export default function SurveyPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);

  const setRadio = (id: string, value: string) =>
    setAnswers(prev => ({ ...prev, [id]: value }));

  const toggleCheckbox = (id: string, value: string) =>
    setAnswers(prev => {
      const cur = (prev[id] as string[]) ?? [];
      return { ...prev, [id]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] };
    });

  const setText = (id: string, value: string) =>
    setAnswers(prev => ({ ...prev, [id]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Survey submitted:', answers);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── 送信後の完了画面 ──────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#F6F0E7', fontFamily: "'Zen Kaku Gothic New', sans-serif", display: 'flex', flexDirection: 'column' }}>
        <SurveyHeader />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/uploads/02_mascot_main.png" alt="" style={{ width: '100px', height: 'auto', margin: '0 auto 24px', display: 'block', filter: 'drop-shadow(0 0 20px rgba(255,170,80,.5))', animation: 'tomoFloat 5s ease-in-out infinite' }} />
            <h2 style={{ fontWeight: 700, fontSize: '26px', color: '#352A20', marginBottom: '16px' }}>ご回答ありがとうございます！</h2>
            <p style={{ fontSize: '16px', color: '#6E5D4F', lineHeight: 1.8, marginBottom: '36px' }}>
              あなたの声はTOMOSHIBIをより良くするための大切なヒントになります。<br />
              β版テストの情報などは連絡先にお届けする予定です。
            </p>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#E2611C', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '17px', padding: '16px 40px', borderRadius: '999px', boxShadow: '0 10px 28px rgba(226,97,28,.35)' }}>
              LPに戻る
            </a>
          </div>
        </main>
        <SurveyFooter />
      </div>
    );
  }

  // ── メインフォーム ────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F6F0E7', fontFamily: "'Zen Kaku Gothic New', sans-serif", color: '#3B2E25', WebkitFontSmoothing: 'antialiased' }}>
      <SurveyHeader />

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px 80px' }}>

        {/* ── ヒーローエリア ── */}
        <div style={{ position: 'relative', padding: '40px 0 32px', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/13c_glow.png"
            alt=""
            aria-hidden
            style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', width: '180px', opacity: 0.6, pointerEvents: 'none', animation: 'tomoGlow 6s ease-in-out infinite' }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/02_mascot_main.png"
            alt=""
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '110px', height: 'auto', filter: 'drop-shadow(0 4px 16px rgba(200,130,50,.3))', animation: 'tomoFloat 5s ease-in-out infinite' }}
          />
          <div style={{ paddingRight: '150px' }}>
            <h1 style={{ fontWeight: 900, fontSize: '32px', letterSpacing: '.06em', color: '#1C1612', marginBottom: '12px' }}>
              {FORM_CONFIG.title}
            </h1>
            <p style={{ fontSize: '15px', lineHeight: 1.85, color: '#6E5D4F', whiteSpace: 'pre-line', marginBottom: '20px' }}>
              {FORM_CONFIG.subtitle}
            </p>
            {/* タイマーバッジ */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFF5EE', border: '1px solid #F4C8A4', borderRadius: '999px', padding: '6px 16px', fontSize: '14px', fontWeight: 600, color: '#E2611C' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {FORM_CONFIG.timeEstimate}
            </div>
            {/* プログレスバー */}
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '6px', background: '#EBE0CF', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#E2611C', borderRadius: '999px' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#B08060', whiteSpace: 'nowrap' }}>1 / 1</span>
            </div>
          </div>
        </div>

        {/* ── フォームカード ── */}
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 32px rgba(143,84,30,.08)', overflow: 'hidden' }}>
            {FORM_CONFIG.questions.map((q, qi) => (
              <div key={q.id}>
                {qi > 0 && <div style={{ height: '1px', background: '#EDE5D8', margin: '0 24px' }} />}
                <div style={{ padding: '28px 28px' }}>
                  <p style={{ fontWeight: 700, fontSize: '15px', color: '#352A20', marginBottom: '16px', lineHeight: 1.6 }}>{q.label}</p>

                  {/* Radio */}
                  {q.type === 'radio' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px' }}>
                      {q.options.map(opt => {
                        const selected = answers[q.id] === opt;
                        return (
                          <label key={opt} onClick={() => setRadio(q.id, opt)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{
                              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                              border: selected ? '6px solid #E2611C' : '2px solid #C8B8A8',
                              background: '#fff',
                              transition: 'border 0.15s',
                            }} />
                            <span style={{ fontSize: '14px', color: selected ? '#C04D12' : '#52443A', fontWeight: selected ? 600 : 400 }}>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Checkbox */}
                  {q.type === 'checkbox' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px' }}>
                      {q.options.map(opt => {
                        const checked = ((answers[q.id] as string[]) ?? []).includes(opt);
                        return (
                          <label key={opt} onClick={() => toggleCheckbox(q.id, opt)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{
                              width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                              border: checked ? 'none' : '2px solid #C8B8A8',
                              background: checked ? '#E2611C' : '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'background 0.15s',
                            }}>
                              {checked && (
                                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                                  <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <span style={{ fontSize: '14px', color: checked ? '#C04D12' : '#52443A', fontWeight: checked ? 600 : 400 }}>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Textarea */}
                  {q.type === 'textarea' && (
                    <textarea
                      placeholder={q.placeholder}
                      value={(answers[q.id] as string) ?? ''}
                      onChange={e => setText(q.id, e.target.value)}
                      style={{ width: '100%', minHeight: '100px', padding: '12px 14px', border: '1.5px solid #DDD3C4', borderRadius: '10px', fontSize: '14px', color: '#352A20', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box' }}
                    />
                  )}

                  {/* Email */}
                  {q.type === 'email' && (
                    <>
                      <div style={{ position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B2E25" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <input
                          type="email"
                          placeholder={q.placeholder}
                          value={(answers[q.id] as string) ?? ''}
                          onChange={e => setText(q.id, e.target.value)}
                          style={{ width: '100%', padding: '12px 14px 12px 38px', border: '1.5px solid #DDD3C4', borderRadius: '10px', fontSize: '14px', color: '#352A20', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                      </div>
                      {'hint' in q && q.hint && (
                        <p style={{ fontSize: '12px', color: '#A08070', marginTop: '8px' }}>{q.hint}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* 送信ボタン */}
            <div style={{ padding: '8px 28px 36px', textAlign: 'center' }}>
              <button
                type="submit"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#E2611C', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 700, fontSize: '18px', padding: '18px 52px', borderRadius: '999px', cursor: 'pointer', boxShadow: '0 10px 28px rgba(226,97,28,.38)', letterSpacing: '.04em' }}
              >
                {FORM_CONFIG.submitLabel}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <p style={{ fontSize: '13px', color: '#A99683', marginTop: '14px' }}>{FORM_CONFIG.submitNote}</p>
            </div>
          </div>
        </form>
      </main>

      <SurveyFooter />
    </div>
  );
}

// ── 共通コンポーネント ──────────────────────────────────────

function SurveyHeader() {
  return (
    <header style={{ background: '#F6F0E7', borderBottom: '1px solid #E8DECE', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/uploads/05_mascot_circle.png" alt="" style={{ width: '34px', height: '34px', borderRadius: '50%' }} />
        <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '.14em', color: '#1C1612', fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>TOMOSHIBI</span>
      </a>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#8C7B69', textDecoration: 'none', fontWeight: 500, fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        LP に戻る
      </a>
    </header>
  );
}

function SurveyFooter() {
  return (
    <footer style={{ background: '#1C1612', padding: '22px 28px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uploads/05_mascot_circle.png" alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
          <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '.14em', color: '#FBF3E8', fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>TOMOSHIBI</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {[
            { href: '#', src: '/uploads/12a_instagram.png', label: 'Instagram' },
            { href: '#', src: '/uploads/12b_x.png', label: 'X' },
            { href: '#', src: '/uploads/12c_tiktok.png', label: 'TikTok' },
          ].map(({ href, src, label }) => (
            <a key={label} href={href} aria-label={label}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={label} style={{ width: '18px', height: '18px', filter: 'invert(1) brightness(1.7)' }} />
            </a>
          ))}
        </div>
        <span style={{ color: '#8C7B69', fontSize: '12px', fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>© 2026 TOMOSHIBI</span>
      </div>
    </footer>
  );
}
