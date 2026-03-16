'use client';
import { useEffect, useState } from 'react';

const LOCALE_CODES = ['ja','de','ar','fr','es','zh','hi','pt','ko','it'];
const FLAGS: Record<string,string> = {
  ja:'🇯🇵',de:'🇩🇪',ar:'🇸🇦',fr:'🇫🇷',es:'🇪🇸',
  zh:'🇨🇳',hi:'🇮🇳',pt:'🇧🇷',ko:'🇰🇷',it:'🇮🇹'
};

const LOCALES = LOCALE_CODES.map(code => ({
  code,
  name: '',
  flag: FLAGS[code]
}));

interface LocaleInfo {
  before: string | null;
  after: string | null;
  status: 'translated' | 'missing';
  score: number;
}

interface KeyGroup {
  key: string;
  value: string;
  tone: string;
  ambiguity_score: number;
  locales: Record<string, LocaleInfo>;
  coverage: number;
}

export default function QualityPage() {
  const [keys, setKeys] = useState<KeyGroup[]>([]);
  const [totalKeys, setTotalKeys] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLocale, setSelectedLocale] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [fixingAll, setFixingAll] = useState(false);
  const [fixProgress, setFixProgress] = useState<{ locale: string; status: string } | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [translationLog, setTranslationLog] = useState<Array<{locale: string, key: string, before: string, after: string, timestamp: number}>>([]);
  const [fixComplete, setFixComplete] = useState(false);
  const [translatedLocales, setTranslatedLocales] = useState<string[]>([]);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/quality?locales=ja,de,ar,fr,es,zh,hi,pt,ko,it')
      .then(r => r.json())
      .then(d => {
        // Group flat array into keyed structure
        const rawItems: any[] = d.keys || d.scores || [];
        
        // Group by key name
        const grouped: Record<string, KeyGroup> = {};
        rawItems.forEach((item: any) => {
          if (!grouped[item.key]) {
            grouped[item.key] = {
              key: item.key,
              value: item.source_en || item.key,
              tone: item.tone || 'neutral',
              ambiguity_score: item.ambiguity_score || 5,
              locales: {},
              coverage: 0,
            };
          }
          grouped[item.key].locales[item.locale] = {
            before: item.before || null,
            after: item.after === 'Missing' ? null : (item.after || null),
            status: item.after && item.after !== 'Missing' ? 'translated' : 'missing',
            score: item.after && item.after !== 'Missing' ? 100 : 0,
          };
        });

        const keysArray = Object.values(grouped);

        // Coverage per key
        keysArray.forEach((k: KeyGroup) => {
          const translated = LOCALE_CODES.filter(l => k.locales[l]?.status === 'translated').length;
          k.coverage = Math.round((translated / LOCALE_CODES.length) * 100);
        });

        setKeys(keysArray);
        setTotalKeys(d.total_keys || keysArray.length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleFixAll = async () => {
    setShowDialog(true);
    setFixingAll(true);
    setFixComplete(false);
    setTranslatedLocales([]);
    setTranslationLog([]);
    setFixProgress({ locale: 'Starting...', status: 'initializing' });
    
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locales: LOCALES.map(l => l.code) }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
          try {
            const event = JSON.parse(line.slice(5));
            if (event.type === 'locale_start') {
              setFixProgress({ locale: event.locale.toUpperCase(), status: `Pass ${event.pass} of 2` });
            } else if (event.type === 'locale_done') {
              setFixProgress({ locale: event.locale.toUpperCase(), status: '✓ Done' });
              setTranslatedLocales(prev => [...prev, event.locale]);
              // Add to log
              setTranslationLog(prev => [...prev, {
                locale: event.locale.toUpperCase(),
                key: `${event.keys || 0} keys processed`,
                before: '',
                after: 'Completed',
                timestamp: Date.now()
              }]);
            } else if (event.type === 'translation') {
              // Log individual translations
              setTranslationLog(prev => [...prev, {
                locale: event.locale?.toUpperCase() || 'UNK',
                key: event.key || '',
                before: event.before || '',
                after: event.after || '',
                timestamp: Date.now()
              }]);
            }
          } catch {}
        }
      }
      setFixComplete(true);
      setFixProgress({ locale: 'All done!', status: 'complete' });
      setTimeout(() => { 
        setFixProgress(null); 
        fetchData(); 
      }, 2000);
    } catch {
      setFixProgress({ locale: 'Error', status: 'failed' });
    } finally {
      setFixingAll(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 40, color: '#71717a', fontFamily: 'monospace', fontSize: 14 }}>
      Loading quality data...
    </div>
  );

  if (keys.length === 0) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 16, color: '#52525b' }}>◎</div>
      <p style={{ color: '#71717a', fontFamily: 'monospace', fontSize: 14 }}>No scan data yet.</p>
      <p style={{ color: '#52525b', fontFamily: 'monospace', fontSize: 12, marginTop: 8 }}>
        Run a scan from the Overview tab.
      </p>
    </div>
  );

  // Calculate coverage by locale from grouped keys
  const byLocale: Record<string,number> = {};
  LOCALE_CODES.forEach(locale => {
    const translated = keys.filter((k: KeyGroup) => 
      k.locales[locale]?.status === 'translated'
    ).length;
    byLocale[locale] = keys.length > 0 
      ? Math.round((translated / keys.length) * 100) 
      : 0;
  });

  // Flatten keys with locales for filtering
  interface FlatItem extends KeyGroup {
    locale: string;
    before: string | null;
    after: string | null;
    status: 'translated' | 'missing';
  }
  
  const flatItems: FlatItem[] = [];
  keys.forEach((k: KeyGroup) => {
    LOCALE_CODES.forEach(locale => {
      const loc = k.locales[locale];
      if (loc) {
        flatItems.push({
          ...k,
          locale,
          before: loc.before,
          after: loc.after,
          status: loc.status,
        });
      }
    });
  });

  // Filter by locale and search
  const filteredItems = flatItems.filter(item => {
    const matchLocale = selectedLocale === 'all' || item.locale === selectedLocale;
    const matchSearch = !search || 
      item.key.toLowerCase().includes(search.toLowerCase()) ||
      (item.value || '').toLowerCase().includes(search.toLowerCase());
    return matchLocale && matchSearch;
  });

  // Stats
  const translatedCount = filteredItems.filter(s => s.status === 'translated').length;
  const missingCount = filteredItems.filter(s => s.status === 'missing').length;
  const improvedCount = keys.reduce((sum, k) => {
    return sum + LOCALE_CODES.filter(locale => {
      const loc = k.locales[locale];
      return loc?.status === 'translated' && loc.before && loc.after && loc.before !== loc.after;
    }).length;
  }, 0);

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1600 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f4f4f5', margin: 0, fontFamily: 'monospace' }}>
            Translation Quality
          </h1>
          <p style={{ color: '#71717a', marginTop: 6, fontSize: 13 }}>
            Compare blind vs context-aware translations
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {fixProgress && (
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#a3e635' }}>
              {fixProgress.locale} — {fixProgress.status}
            </span>
          )}
          <button onClick={handleFixAll} disabled={fixingAll} style={{
            fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
            padding: '11px 26px', borderRadius: 8, border: 'none',
            background: fixingAll ? '#1a1a1a' : '#a3e635',
            color: fixingAll ? '#71717a' : '#09090b',
            cursor: fixingAll ? 'not-allowed' : 'pointer',
            boxShadow: fixingAll ? 'none' : '0 0 20px rgba(163,230,53,0.25)',
            transition: 'all 200ms',
          }}>
            {fixingAll ? `◌ Translating...` : '⚡ Translate'}
          </button>
        </div>
      </div>

      {/* Translation Progress Card */}
      {(fixingAll || translatedLocales.length > 0) && (
        <div style={{
          background: '#0d0d0f',
          border: '1px solid rgba(163,230,53,0.2)',
          borderRadius: 16,
          padding: 28,
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Animated scanning line — only while fixing */}
          {fixingAll && (
            <div style={{
              position: 'absolute',
              top: 0, left: '-100%',
              width: '60%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(163,230,53,0.06), transparent)',
              animation: 'scanLine 1.8s ease-in-out infinite',
            }} />
          )}

          {/* Pulsing border glow — only while fixing */}
          {fixingAll && (
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: 16,
              boxShadow: '0 0 40px rgba(163,230,53,0.08)',
              animation: 'glowPulse 2s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          )}

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            {fixingAll ? (
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#a3e635',
                animation: 'pulse 1s ease-in-out infinite',
              }} />
            ) : (
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }} />
            )}
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#f4f4f5', fontWeight: 600 }}>
              {fixingAll
                ? `Translating... ${fixProgress?.locale ?? ''} — ${fixProgress?.status ?? ''}`
                : `✓ Translation complete — ${translatedLocales.length}/10 locales`}
            </span>
          </div>

          {/* Locale grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {[
              {code:'ja',flag:'🇯🇵'},{code:'de',flag:'🇩🇪'},{code:'ar',flag:'🇸🇦'},
              {code:'fr',flag:'🇫🇷'},{code:'es',flag:'🇪🇸'},{code:'zh',flag:'🇨🇳'},
              {code:'hi',flag:'🇮🇳'},{code:'pt',flag:'🇧🇷'},{code:'ko',flag:'🇰🇷'},
              {code:'it',flag:'🇮🇹'},
            ].map((l, i) => {
              const done = translatedLocales.includes(l.code.toUpperCase()) ||
                           translatedLocales.includes(l.code);
              const isActive = fixProgress?.locale === l.code.toUpperCase() && fixingAll;
              return (
                <div key={l.code} style={{
                  background: done
                    ? 'rgba(163,230,53,0.1)'
                    : isActive
                      ? 'rgba(163,230,53,0.05)'
                      : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${done
                    ? 'rgba(163,230,53,0.3)'
                    : isActive
                      ? 'rgba(163,230,53,0.2)'
                      : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 10,
                  padding: '12px 8px',
                  textAlign: 'center',
                  transition: 'all 400ms ease',
                  animation: isActive ? 'localeActive 0.8s ease-in-out infinite' : 'none',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{l.flag}</div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: 11,
                    color: done ? '#a3e635' : isActive ? '#bef264' : '#52525b',
                    fontWeight: done ? 600 : 400,
                  }}>
                    {l.code.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 16, marginTop: 2 }}>
                    {done ? '✓' : isActive ? '◎' : '○'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CSS animations */}
          <style>{`
            @keyframes scanLine {
              0% { left: -60%; }
              100% { left: 160%; }
            }
            @keyframes glowPulse {
              0%, 100% { box-shadow: 0 0 20px rgba(163,230,53,0.05); }
              50% { box-shadow: 0 0 50px rgba(163,230,53,0.15); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(0.8); }
            }
            @keyframes localeActive {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.04); }
            }
          `}</style>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'IMPROVED', value: improvedCount, color: '#a3e635', sub: 'context made a difference' },
          { label: 'SHOWING', value: filteredItems.length, color: '#34d399', sub: 'filtered results' },
          { label: 'TOTAL KEYS', value: totalKeys, color: '#f4f4f5' },
          { label: 'TRANSLATED', value: translatedCount, color: '#60a5fa', sub: 'across all locales' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#111113',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '20px 24px',
          }}>
            <div style={{ fontSize: 10, color: '#71717a', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 8 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: stat.color, fontFamily: 'monospace', lineHeight: 1 }}>
              {stat.value}
            </div>
            {stat.sub && <div style={{ fontSize: 11, color: '#52525b', marginTop: 6, fontFamily: 'monospace' }}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {/* Locale tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedLocale('all')}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: 'none',
            background: selectedLocale === 'all' ? '#a3e635' : '#111113',
            color: selectedLocale === 'all' ? '#09090b' : '#f4f4f5',
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ALL LOCALES
        </button>
        {LOCALES.map((locale: any) => {
          const coverage = byLocale[locale.code] || 0;
          const color = coverage > 80 ? '#34d399' : coverage > 40 ? '#fbbf24' : '#f87171';
          return (
            <button
              key={locale.code}
              onClick={() => setSelectedLocale(locale.code)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `1px solid ${color}40`,
                background: selectedLocale === locale.code ? `${color}20` : '#111113',
                color: selectedLocale === locale.code ? color : '#f4f4f5',
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {locale.flag} {locale.code.toUpperCase()} {coverage}%
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by key or English text..."
          style={{
            width: '100%',
            background: '#111113',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '12px 16px',
            color: '#f4f4f5',
            fontSize: 14,
            fontFamily: 'monospace',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ fontSize: 12, color: '#52525b', fontFamily: 'monospace', marginBottom: 16 }}>
        Showing {filteredItems.length} translation{filteredItems.length !== 1 ? 's' : ''} across {keys.length} keys
      </div>

      {/* Table */}
      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#71717a', fontFamily: 'monospace' }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: '#3f3f46' }}>🎉</div>
          <p style={{ color: '#a3e635', fontFamily: 'monospace', fontSize: 14, fontWeight: 600 }}>
            No translations found!
          </p>
          <p style={{ color: '#71717a', fontFamily: 'monospace', fontSize: 12, marginTop: 8 }}>
            Try adjusting your filters or run a scan.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 2fr 2fr 2fr 1fr',
            gap: 16,
            padding: '12px 20px',
            background: '#111113',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            {['KEY', 'ENGLISH SOURCE', 'BEFORE (BLIND)', 'AFTER (CONTEXT)', 'STATUS'].map(h => (
              <div key={h} style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#71717a',
              }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filteredItems.map((item: FlatItem, idx: number) => {
            return (
              <div
                key={`${item.key}-${item.locale}-${idx}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 2fr 2fr 2fr 1fr',
                  gap: 16,
                  padding: '16px 20px',
                  background: idx % 2 === 0 ? '#0a0a0b' : '#0d0d0f',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 150ms',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#151518')}
                onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#0a0a0b' : '#0d0d0f')}
              >
                {/* Key */}
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#a3e635', fontWeight: 600 }}>
                    {item.key}
                  </div>
                  <div style={{ fontSize: 11, color: '#71717a', marginTop: 4, fontFamily: 'monospace' }}>
                    {item.locale.toUpperCase()}
                  </div>
                </div>

                {/* English Source */}
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(96,165,250,0.1)',
                  borderRadius: 6,
                  border: '1px solid rgba(96,165,250,0.2)',
                }}>
                  <div style={{ fontSize: 13, color: '#f4f4f5', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
                    {item.value || item.key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </div>
                </div>

                {/* Before (Blind) - ALWAYS SHOW */}
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(248,113,113,0.1)',
                  borderRadius: 6,
                  border: '1px solid rgba(248,113,113,0.2)',
                }}>
                  <div style={{ fontSize: 13, color: item.before ? '#fca5a5' : '#71717a', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
                    {item.before || '—'}
                  </div>
                </div>

                {/* After (Context) - Show value or "not translated yet" */}
                <div style={{
                  padding: '8px 12px',
                  background: item.status === 'missing' ? 'rgba(113,113,122,0.1)' : 'rgba(52,211,153,0.1)',
                  borderRadius: 6,
                  border: `1px solid ${item.status === 'missing' ? 'rgba(113,113,122,0.2)' : 'rgba(52,211,153,0.3)'}`,
                }}>
                  {item.status === 'translated' && item.after ? (
                    <div style={{ 
                      fontSize: 13, 
                      color: '#6ee7b7',
                      fontFamily: 'sans-serif', 
                      lineHeight: 1.5,
                      fontWeight: 600,
                    }}>
                      ✨ {item.after}
                    </div>
                  ) : (
                    <div style={{ 
                      fontSize: 12, 
                      color: '#71717a',
                      fontFamily: 'sans-serif', 
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                    }}>
                      — not translated yet —
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <span style={{
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 12,
                    background: item.status === 'translated' ? 'rgba(52,211,153,0.2)' : 'rgba(113,113,122,0.2)',
                    color: item.status === 'translated' ? '#34d399' : '#71717a',
                    fontFamily: 'monospace',
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Glassmorphism Progress Dialog */}
      {showDialog && (
        <div
          onClick={() => fixComplete && setShowDialog(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
            cursor: fixComplete ? 'pointer' : 'default',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 24,
              padding: 32,
              maxWidth: 600,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{
                  fontSize: 24,
                  animation: fixComplete ? 'none' : 'pulse 1.5s ease-in-out infinite',
                }}>
                  {fixComplete ? '🎉' : fixingAll ? '◌' : '✓'}
                </div>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#f4f4f5',
                  margin: 0,
                  fontFamily: 'monospace',
                }}>
                  {fixComplete ? 'Translation Complete!' : fixingAll ? 'Fixing Translations...' : 'Done!'}
                </h2>
              </div>
              {!fixComplete && (
                <p style={{
                  color: '#71717a',
                  fontSize: 13,
                  margin: 0,
                  fontFamily: 'monospace',
                }}>
                  Processing translations with context-aware AI...
                </p>
              )}
            </div>

            {/* Progress Bar */}
            {!fixComplete && (
              <div style={{
                width: '100%',
                height: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                overflow: 'hidden',
                marginBottom: 20,
              }}>
                <div style={{
                  height: '100%',
                  width: fixProgress?.status === 'complete' ? '100%' : '70%',
                  background: 'linear-gradient(90deg, #a3e635, #84cc16)',
                  transition: 'width 0.3s ease',
                  animation: !fixProgress ? 'shimmer 1.5s infinite' : 'none',
                }} />
              </div>
            )}

            {/* Current Status */}
            {fixProgress && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(163, 230, 53, 0.1)',
                border: '1px solid rgba(163, 230, 53, 0.3)',
                borderRadius: 12,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>{fixProgress.status === 'complete' ? '✅' : '⚡'}</span>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: '#a3e635',
                  fontWeight: 600,
                }}>
                  {fixProgress.locale} — {fixProgress.status}
                </span>
              </div>
            )}

            {/* Translation Log */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: 20,
              paddingRight: 8,
            }}>
              <div style={{
                fontSize: 11,
                color: '#71717a',
                fontFamily: 'monospace',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                Recent Translations
              </div>
              
              {translationLog.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  color: '#52525b',
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}>
                  Starting translation process...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {translationLog.slice(-8).reverse().map((log, idx) => (
                    <div key={idx} style={{
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: 11,
                          color: '#a3e635',
                          fontWeight: 600,
                        }}>
                          {log.locale}
                        </span>
                        <span style={{
                          fontSize: 10,
                          color: '#71717a',
                          fontFamily: 'monospace',
                        }}>
                          {log.key}
                        </span>
                      </div>
                      {log.before && log.after && log.after !== 'Completed' && (
                        <div style={{
                          display: 'flex',
                          gap: 8,
                          fontSize: 11,
                        }}>
                          <span style={{ color: '#fca5a5', textDecoration: 'line-through' }}>
                            {log.before}
                          </span>
                          <span style={{ color: '#71717a' }}>→</span>
                          <span style={{ color: '#6ee7b7', fontWeight: 600 }}>
                            {log.after}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Results Button */}
            {fixComplete && (
              <button
                onClick={() => {
                  setShowDialog(false);
                  window.location.href = '/dashboard/results';
                }}
                style={{
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #a3e635, #84cc16)',
                  border: 'none',
                  borderRadius: 12,
                  color: '#09090b',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 10px 25px rgba(163, 230, 53, 0.3)',
                  transition: 'all 200ms',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 15px 30px rgba(163, 230, 53, 0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 25px rgba(163, 230, 53, 0.3)';
                }}
              >
                📊 View Complete Results
                <span>→</span>
              </button>
            )}

            {!fixComplete && (
              <div style={{
                textAlign: 'center',
                color: '#71717a',
                fontFamily: 'monospace',
                fontSize: 11,
                marginTop: 12,
              }}>
                Please wait... do not close this window
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Add CSS animations
if (typeof document !== 'undefined') {
  const styleId = 'quality-page-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    `;
    document.head.appendChild(style);
  }
}
