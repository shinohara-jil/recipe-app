'use client';

import { useEffect, useRef, useState } from 'react';
import type { Recipe } from '@/app/types/recipe';

export interface ChatRecommendation {
  id: string;
  title: string;
  reason: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  recommendations?: ChatRecommendation[];
}

interface ChatModalProps {
  onClose: () => void;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  recipes: Recipe[];
  onOpenRecipe: (id: string) => void;
  onToggleTodayMenu: (recipe: Recipe) => void;
  requirePasscode: (retry: () => void) => void;
}

const QUICK_QUESTIONS = ['さっぱりしたもの', '冷蔵庫の残り物で作りたい', '今日は簡単に済ませたい', '子どもが食べやすいもの'];

export default function ChatModal({
  onClose,
  messages,
  onMessagesChange,
  recipes,
  onOpenRecipe,
  onToggleTodayMenu,
  requirePasscode,
}: ChatModalProps) {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isThinking]);

  const send = async (text: string, base: ChatMessage[] = messages) => {
    const message = text.trim();
    if (!message || isThinking) return;
    const withQuestion: ChatMessage[] = [...base, { role: 'user', text: message }];
    onMessagesChange(withQuestion);
    setInput('');
    setError(null);
    setIsThinking(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: base.map((m) => ({ role: m.role, text: m.text, recipeIds: m.recommendations?.map((r) => r.id) })),
        }),
      });
      if (response.status === 401) {
        // 合言葉を入れてもらってから、同じ質問をもう一度送る
        onMessagesChange(base);
        setInput(message);
        requirePasscode(() => send(message, base));
        return;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      onMessagesChange([...withQuestion, { role: 'assistant', text: data.reply, recommendations: data.recommendations }]);
    } catch (e) {
      console.error('Chat failed:', e);
      onMessagesChange(base);
      setInput(message);
      setError('AIに相談できませんでした。少し待ってからもう一度送ってください。');
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="chat-title">
      <div className="flex h-full w-full max-w-lg flex-col bg-gradient-to-br from-orange-50 to-amber-50 sm:rounded-lg sm:shadow-xl">
        <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-3 sm:rounded-t-lg">
          <h2 id="chat-title" className="text-lg font-bold text-gray-800">
            AIに相談
          </h2>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onMessagesChange([]);
                  setError(null);
                }}
                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                新しい相談
              </button>
            )}
            <button type="button" onClick={onClose} className="text-2xl leading-none text-gray-500 hover:text-gray-700" aria-label="閉じる">
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
          <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
            今の気分や食べたいものを教えてください。登録してあるレシピの中から選びます。
          </div>

          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-tr-sm bg-orange-700 px-3 py-2 text-sm text-white">
                {m.text}
              </div>
            ) : (
              <div key={i} className="max-w-[88%] space-y-2 rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                <p>{m.text}</p>
                {m.recommendations?.map((rec) => {
                  const recipe = recipes.find((r) => r.id === rec.id);
                  return (
                    <div key={rec.id} className="flex items-stretch gap-1 rounded-lg border border-gray-200 bg-gray-50">
                      <button type="button" onClick={() => onOpenRecipe(rec.id)} className="min-w-0 flex-1 px-3 py-2 text-left hover:bg-gray-100">
                        <span className="block font-semibold text-gray-800">{rec.title}</span>
                        <span className="block text-xs text-orange-700">{rec.reason}</span>
                      </button>
                      {recipe && (
                        <button
                          type="button"
                          onClick={() => onToggleTodayMenu(recipe)}
                          className={`flex w-11 flex-none items-center justify-center rounded-r-lg transition-colors ${
                            recipe.isTodayMenu ? 'bg-orange-50 text-orange-500' : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'
                          }`}
                          title={recipe.isTodayMenu ? '今日のメニューから外す' : '今日のメニューにする'}
                          aria-label={recipe.isTodayMenu ? `${rec.title}を今日のメニューから外す` : `${rec.title}を今日のメニューにする`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill={recipe.isTodayMenu ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {isThinking && (
            <div className="inline-flex gap-1 rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3" aria-label="考え中">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
            </div>
          )}

          {messages.length === 0 && !isThinking && (
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button key={q} type="button" onClick={() => send(q)} className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  {q}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:rounded-b-lg"
        >
          <label htmlFor="chat-input" className="sr-only">
            メッセージ
          </label>
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            placeholder="例：さっぱりしたものが食べたい"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-full border border-gray-300 px-4 py-2 text-base focus:border-transparent focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-orange-700 text-white hover:bg-orange-800 disabled:bg-gray-300"
            aria-label="送る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
