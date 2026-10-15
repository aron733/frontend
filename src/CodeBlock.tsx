import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Clipboard } from '@capacitor/clipboard';

interface Props {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Clipboard.write({ string: code });
      } else {
        await navigator.clipboard.writeText(code);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('copy err', e);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        {language && <span style={styles.lang}>{language}</span>}
        <button onClick={handleCopy} style={styles.copyBtn}>
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copié
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copier
            </>
          )}
        </button>
      </div>
      <pre style={styles.pre}>
        <code style={styles.code}>{code}</code>
      </pre>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    background: 'rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '10px',
    margin: '10px 0',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 12px',
    background: 'rgba(102, 126, 234, 0.08)',
    borderBottom: '1px solid rgba(102, 126, 234, 0.15)',
  },
  lang: {
    color: '#a8b0ff',
    fontSize: '11px',
    fontFamily: 'monospace',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  copyBtn: {
    background: 'transparent',
    border: 'none',
    color: '#a8b0ff',
    cursor: 'pointer',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '5px',
    fontFamily: 'inherit',
  },
  pre: {
    margin: 0,
    padding: '12px',
    overflowX: 'auto' as const,
  },
  code: {
    color: '#e0e0f0',
    fontSize: '12.5px',
    fontFamily: "'SF Mono', Monaco, Consolas, monospace",
    background: 'transparent',
  },
};
