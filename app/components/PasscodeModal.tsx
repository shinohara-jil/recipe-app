'use client';

import { useState } from 'react';

interface PasscodeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// 開いている間だけ表示する（閉じると入力中の文字も消える）
export default function PasscodeModal({ onClose, onSuccess }: PasscodeModalProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/ai-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      if (response.ok) {
        onSuccess();
      } else if (response.status === 401) {
        setError('合言葉が違います。もう一度入れてください。');
      } else {
        setError('合言葉を確認できませんでした。時間をおいて試してください。');
      }
    } catch {
      setError('通信できませんでした。電波の良いところで試してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="passcode-title">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-3">
        <h2 id="passcode-title" className="text-lg font-bold text-gray-800">
          合言葉を入れてください
        </h2>
        <p className="text-sm text-gray-700">AIの機能（材料の読み取り）は、家族だけが使えるように合言葉で守っています。</p>
        <label htmlFor="passcode-input" className="sr-only">
          合言葉
        </label>
        <input
          id="passcode-input"
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          autoComplete="current-password"
          autoFocus
          placeholder="合言葉"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
        />
        <p className="text-xs text-gray-500">一度入れると、この端末では30日間入力しなくて大丈夫です。</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
            やめる
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !passcode}
            className="flex-1 rounded-lg bg-orange-700 py-2.5 font-bold text-white hover:bg-orange-800 disabled:bg-gray-300"
          >
            {isSubmitting ? '確認中…' : 'OK'}
          </button>
        </div>
      </form>
    </div>
  );
}
