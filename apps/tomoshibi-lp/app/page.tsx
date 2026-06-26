'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    nodes.forEach(el => {
      const e = el as HTMLElement;
      e.style.opacity = '0';
      e.style.transform = 'translateY(24px)';
      e.style.transition = 'opacity .7s cubic-bezier(.22,.61,.36,1), transform .7s cubic-bezier(.22,.61,.36,1)';
    });

    const reveal = (el: Element, delay: number) =>
      setTimeout(() => {
        const e = el as HTMLElement;
        e.style.opacity = '1';
        e.style.transform = 'translateY(0)';
      }, delay);

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const sibs = entry.target.parentElement
              ? Array.from(entry.target.parentElement.querySelectorAll(':scope > [data-reveal]'))
              : [entry.target];
            reveal(entry.target, Math.max(0, sibs.indexOf(entry.target)) * 100);
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      nodes.forEach(n => io.observe(n));
    }

    setTimeout(() => {
      nodes.forEach(n => {
        const e = n as HTMLElement;
        e.style.opacity = '1';
        e.style.transform = 'translateY(0)';
      });
    }, 2400);
  }, []);

  return (
    <div style={{ fontFamily: "'Zen Kaku Gothic New',sans-serif", color: '#3B2E25', background: '#F6F0E7', overflowX: 'hidden', WebkitFontSmoothing: 'antialiased', lineHeight: 1.7 }}>

      {/* ===== HERO ===== */}
      <section
        id="top"
        className="hero-section"
        style={{ position: 'relative', overflow: 'hidden', background: '#16110D', display: 'flex', flexDirection: 'column' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/uploads/hero_night.png"
          alt=""
          aria-hidden
          className="hero-img"
        />
        <div
          className="hero-gradient"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
        />

        {/* NAV */}
        <header style={{ position: 'relative', zIndex: 3, maxWidth: '1080px', margin: '0 auto', padding: '26px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/uploads/05_mascot_circle.png" alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', filter: 'drop-shadow(0 0 12px rgba(255,180,90,.55))' }} />
            <span style={{ fontWeight: 700, fontSize: '22px', letterSpacing: '.16em', color: '#FBF3E8' }}>TOMOSHIBI</span>
          </a>
          <nav className="nav-links" style={{ alignItems: 'center' }}>
            {[
              { href: '#empathy', text: '共感' },
              { href: '#feature', text: '特徴' },
              { href: '#flow', text: '体験' },
              { href: '/survey', text: 'アンケート' },
            ].map(({ href, text }) => (
              <a key={href} href={href} style={{ color: '#E7DCCD', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>{text}</a>
            ))}
          </nav>
        </header>

        {/* Hero copy */}
        <div className="hero-copy" style={{ position: 'relative', zIndex: 3 }}>
          <h1 className="hero-h1" style={{ fontWeight: 900, letterSpacing: '.04em', color: '#FBF3E8', textShadow: '0 2px 28px rgba(0,0,0,.65)' }}>
            見過ごしていた景色が、<br />二人だけの冒険になる。
          </h1>
          <p className="hero-sub" style={{ fontSize: '20px', fontWeight: 500, color: '#E3D6C4', marginTop: '24px', letterSpacing: '.04em', textShadow: '0 2px 16px rgba(0,0,0,.5)' }}>AIの相棒と、外へ出かけよう。</p>
          <a
            href="#empathy"
            className="hero-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#E2611C', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '19px', padding: '19px 44px', borderRadius: '999px', marginTop: '40px', boxShadow: '0 14px 34px rgba(226,97,28,.4)' }}
          >
            どんなサービスか見てみる
          </a>
        </div>
      </section>

      {/* ===== EMPATHY ===== */}
      <section id="empathy" className="empathy-section" style={{ background: '#F6F0E7', padding: '90px 28px 70px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 data-reveal className="section-h2" style={{ textAlign: 'center', fontWeight: 700, fontSize: '31px', letterSpacing: '.05em', color: '#352A20', marginBottom: '48px' }}>
            こんな瞬間、ありませんか？
          </h2>
          <div className="empathy-grid">
            {[
              { src: '/uploads/09a_scene_cafe.png', alt: 'カフェのシーン', text: 'ふらっと入ったカフェが最高だった。でも、この良さを伝える相手がいない。' },
              { src: '/uploads/09b_scene_travel.png', alt: '旅先のシーン', text: '旅先で見た景色に心が動いた。写真は撮ったけど、SNSに上げるほどでもない。' },
              { src: '/uploads/09c_scene_night.png', alt: '夜のシーン', text: '一人の時間は好きだ。でも時々、この感動を誰かと分かち合えたらと思う。' },
            ].map((card, i) => (
              <figure key={i} data-reveal style={{ background: '#FCF8F1', border: '1px solid #EBE0CF', borderRadius: '18px', padding: '18px', boxShadow: '0 12px 26px rgba(143,84,30,.06)', margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.src} alt={card.alt} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '11px' }} />
                <figcaption style={{ padding: '20px 8px 8px', textAlign: 'center', fontSize: '15px', lineHeight: 1.95, color: '#52443A' }}>{card.text}</figcaption>
              </figure>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '34px' }}>
            <a href="#cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', color: '#D4581A', textDecoration: 'none', fontSize: '15px', fontWeight: 700, letterSpacing: '.03em' }}>
              <span style={{ fontSize: '18px' }}>→</span>興味がある方はページ下部のアンケートへ
            </a>
          </div>
        </div>
      </section>

      {/* ===== FEATURE ===== */}
      <section id="feature" className="feature-section" style={{ background: '#F6F0E7', padding: '60px 28px 80px' }}>
        <h2 data-reveal className="section-h2" style={{ textAlign: 'center', fontWeight: 700, fontSize: '31px', letterSpacing: '.05em', color: '#352A20', marginBottom: '24px' }}>
          あなたのことを覚えている、AIの相棒。
        </h2>

        {/* Desktop diagram */}
        <div className="feature-diagram" style={{ position: 'relative', maxWidth: '1000px', height: '690px', margin: '0 auto' }}>
          <svg viewBox="0 0 1000 690" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
            <path d="M 230 165 C 300 185, 330 195, 352 215" fill="none" stroke="#E2A468" strokeWidth="2.5" strokeDasharray="6 8" strokeLinecap="round" />
            <path d="M 270 490 C 320 480, 335 470, 352 455" fill="none" stroke="#E2A468" strokeWidth="2.5" strokeDasharray="6 8" strokeLinecap="round" />
            <path d="M 760 320 C 700 320, 680 320, 648 320" fill="none" stroke="#E2A468" strokeWidth="2.5" strokeDasharray="6 8" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', left: '50%', top: '18px', transform: 'translateX(-50%)', zIndex: 2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/uploads/phone-mock.png" alt="TOMOSHIBIアプリのチャット画面" style={{ width: '300px', height: 'auto', filter: 'drop-shadow(0 22px 40px rgba(143,84,30,.22))', mixBlendMode: 'multiply' }} />
          </div>
          <div data-reveal style={{ position: 'absolute', left: 0, top: '70px', width: '240px', textAlign: 'center', zIndex: 2 }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#F1E7D5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: 'inset 0 2px 8px rgba(143,84,30,.07)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/uploads/08a_icon_book.png" alt="" style={{ width: '54px', height: '54px', objectFit: 'contain' }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#352A20', marginBottom: '8px' }}>感動をその場で共有できる</h3>
            <p style={{ fontSize: '13.5px', lineHeight: 1.9, color: '#6E5D4F' }}>外出先で心の動いた瞬間に、自分を知っている相棒と分かち合える</p>
          </div>
          <div data-reveal style={{ position: 'absolute', left: '10px', top: '400px', width: '240px', textAlign: 'center', zIndex: 2 }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#F1E7D5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: 'inset 0 2px 8px rgba(143,84,30,.07)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/uploads/08b_icon_location.png" alt="" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#352A20', marginBottom: '8px' }}>あなたの記憶を覚えている</h3>
            <p style={{ fontSize: '13.5px', lineHeight: 1.9, color: '#6E5D4F' }}>過去のやりとりや会話の記憶が積み重なり、関係性が深まる</p>
          </div>
          <div data-reveal style={{ position: 'absolute', right: 0, top: '230px', width: '250px', textAlign: 'center', zIndex: 2 }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#F1E7D5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: 'inset 0 2px 8px rgba(143,84,30,.07)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/uploads/05_mascot_circle.png" alt="" style={{ width: '78px', height: '78px', borderRadius: '50%' }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#352A20', marginBottom: '8px' }}>次の外出が楽しみになる</h3>
            <p style={{ fontSize: '13.5px', lineHeight: 1.9, color: '#6E5D4F' }}>共有記憶が増えるほど、「また一緒に出かけたい」が生まれる</p>
          </div>
        </div>

        {/* Tablet / Mobile card list */}
        <div className="feature-mobile">
          {[
            { icon: '/uploads/08a_icon_book.png', iconSize: '54px', title: '感動をその場で共有できる', desc: '外出先で心の動いた瞬間に、自分を知っている相棒と分かち合える' },
            { icon: '/uploads/08b_icon_location.png', iconSize: '48px', title: 'あなたの記憶を覚えている', desc: '過去のやりとりや会話の記憶が積み重なり、関係性が深まる' },
            { icon: '/uploads/05_mascot_circle.png', iconSize: '78px', title: '次の外出が楽しみになる', desc: '共有記憶が増えるほど、「また一緒に出かけたい」が生まれる' },
          ].map((item, i) => (
            <div key={i} data-reveal style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#FCF8F1', border: '1px solid #EBE0CF', borderRadius: '16px', padding: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F1E7D5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 2px 8px rgba(143,84,30,.07)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.icon} alt="" style={{ width: item.iconSize, height: item.iconSize, objectFit: 'contain', borderRadius: i === 2 ? '50%' : undefined }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '16px', color: '#352A20', marginBottom: '6px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.85, color: '#6E5D4F', margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FLOW ===== */}
      <section id="flow" className="flow-section" style={{ background: '#F6F0E7', padding: '40px 28px 84px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <h2 data-reveal className="section-h2" style={{ textAlign: 'center', fontWeight: 700, fontSize: '31px', letterSpacing: '.05em', color: '#352A20', marginBottom: '46px' }}>
            TOMOSHIBIとの1日
          </h2>
          <div className="flow-wrapper">
            {[
              { n: 1, text: '朝、相棒と軽く会話する', img: '/uploads/10a_flow1.png' },
              { n: 2, text: '日中に気に入った景色やお店について共有する', img: '/uploads/10b_flow2.png' },
              { n: 3, text: '外出先で見つけた景色やできごとを一緒に楽しむ', img: '/uploads/10c_flow3.png' },
              { n: 4, text: '帰ってきたら、今日の体験が二人の記憶になる', img: '/uploads/10d_flow4.png' },
            ].map((step, idx) => (
              <div key={step.n} style={{ display: 'contents' }}>
                <div data-reveal style={{ flex: 1, maxWidth: '240px', background: '#FCF8F1', border: '1px solid #EBE0CF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 22px rgba(143,84,30,.06)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%', background: '#E2611C', color: '#fff', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{step.n}</span>
                    <p style={{ fontSize: '13.5px', lineHeight: 1.65, fontWeight: 500, color: '#3B2E25', margin: 0 }}>{step.text}</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={step.img} alt="" style={{ width: '100%', height: '130px', objectFit: 'cover', marginTop: 'auto' }} />
                </div>
                {idx < 3 && (
                  <div className="flow-arrow" style={{ color: '#E2611C', fontSize: '26px', fontWeight: 700, flexShrink: 0 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="cta" className="cta-section" style={{ padding: '0 28px 64px' }}>
        <div style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto', background: 'linear-gradient(110deg,#191310 0%,#241913 60%,#2C1E14 100%)', borderRadius: '22px', overflow: 'hidden' }} className="cta-inner">
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(25,19,16,.9) 30%,rgba(25,19,16,.45) 70%,rgba(25,19,16,.2) 100%)', pointerEvents: 'none' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uploads/13c_glow.png" alt="" aria-hidden className="cta-mascot" style={{ position: 'absolute', top: '50%', right: '7%', transform: 'translateY(-50%)', width: '300px', opacity: 0.7, pointerEvents: 'none', animation: 'tomoGlow 6s ease-in-out infinite' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uploads/02_mascot_main.png" alt="" className="cta-mascot" style={{ position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)', width: '140px', height: 'auto', filter: 'drop-shadow(0 0 26px rgba(255,170,80,.45))', animation: 'tomoFloat 5s ease-in-out infinite', zIndex: 2 }} />

          <div className="cta-text" style={{ position: 'relative', zIndex: 3, textAlign: 'center' }}>
            <h2 className="cta-h2" style={{ fontWeight: 700, fontSize: '30px', letterSpacing: '.04em', color: '#FBF3E8' }}>TOMOSHIBIに興味がありますか？</h2>
            <p className="cta-p" style={{ fontSize: '16px', color: '#D9CBBA', marginTop: '14px' }}>30秒で完了するアンケートにご協力ください。</p>
            <a
              href="/survey"
              className="cta-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#E2611C', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '19px', padding: '18px 46px', borderRadius: '999px', marginTop: '30px', boxShadow: '0 14px 32px rgba(226,97,28,.42)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="4" width="14" height="17" rx="2" />
                <path d="M9 4V3.2a1.2 1.2 0 0 1 1.2-1.2h3.6a1.2 1.2 0 0 1 1.2 1.2V4" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="9" y1="14" x2="13" y2="14" />
              </svg>
              アンケートに回答する
            </a>
            <p style={{ fontSize: '13px', color: '#A99683', marginTop: '18px' }}>回答テストへの参加希望も受け付けています</p>
          </div>
        </div>
      </section>

      {/* ===== LINE OPEN CHAT ===== */}
      <section style={{ background: '#F6F0E7', padding: '0 28px 72px' }}>
        <div style={{ maxWidth: '540px', margin: '0 auto', background: '#fff', borderRadius: '22px', padding: '44px 36px', boxShadow: '0 10px 32px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          {/* LINE icon */}
          <div style={{ width: '64px', height: '64px', background: '#06C755', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <svg viewBox="0 0 48 48" width="38" height="38" fill="white" aria-hidden="true">
              <path d="M24 4C13 4 4 11.8 4 21.4c0 6.6 4.3 12.4 10.8 15.7L13 44l7.8-4.2c1 .14 2.1.2 3.2.2 11 0 20-7.8 20-17.4S35 4 24 4z" />
            </svg>
          </div>
          <span style={{ display: 'inline-block', background: '#E6F9EC', color: '#06C755', fontWeight: 700, fontSize: '12px', letterSpacing: '.08em', padding: '4px 14px', borderRadius: '20px', marginBottom: '18px' }}>LINE オープンチャット</span>
          <h2 style={{ fontWeight: 700, fontSize: '18px', color: '#352A20', lineHeight: 1.6, marginBottom: '12px' }}>
            TOMOSHIBI｜ひとりのおでかけに<br />寄り添うAIフレンド
          </h2>
          <p style={{ fontSize: '14px', color: '#6E5D4F', lineHeight: 1.9, marginBottom: '28px' }}>
            コミュニティに参加して情報交換したり、<br />体験テストにいち早く参加できます。
          </p>
          <a
            href="https://line.me/ti/g2/p6M0U9d5j4yz3Z4geON5u_lK43aY04MPnlajwQ?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#06C755', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '16px', padding: '16px 36px', borderRadius: '999px', boxShadow: '0 8px 22px rgba(6,199,85,0.32)' }}
          >
            <svg viewBox="0 0 48 48" width="20" height="20" fill="white" aria-hidden="true">
              <path d="M24 4C13 4 4 11.8 4 21.4c0 6.6 4.3 12.4 10.8 15.7L13 44l7.8-4.2c1 .14 2.1.2 3.2.2 11 0 20-7.8 20-17.4S35 4 24 4z" />
            </svg>
            オープンチャットに参加する
          </a>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#1C1612', padding: '26px 28px' }}>
        <div className="footer-flex" style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/uploads/05_mascot_circle.png" alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            <span style={{ fontWeight: 700, fontSize: '19px', letterSpacing: '.16em', color: '#FBF3E8' }}>TOMOSHIBI</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {[
              { href: '#', src: '/uploads/12a_instagram.png', label: 'Instagram', size: '22px' },
              { href: '#', src: '/uploads/12b_x.png', label: 'X', size: '20px' },
              { href: '#', src: '/uploads/12c_tiktok.png', label: 'TikTok', size: '21px' },
            ].map(({ href, src, label, size }) => (
              <a key={label} href={href} aria-label={label} style={{ display: 'flex' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={label} style={{ width: size, height: size, filter: 'invert(1) brightness(1.7)' }} />
              </a>
            ))}
          </div>
          <div style={{ color: '#8C7B69', fontSize: '13px', letterSpacing: '.05em' }}>© 2026 TOMOSHIBI</div>
        </div>
      </footer>

    </div>
  );
}
