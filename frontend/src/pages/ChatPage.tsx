import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { MovieSummary } from '../api/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  movies?: MovieSummary[];
}

const SUGGESTIONS = [
  'Movies about time travel and paradoxes',
  'Dark crime thrillers with plot twists',
  'Feel-good movies for a rainy day',
  'Epic fantasy adventures',
];

const TMDB_IMG = 'https://image.tmdb.org/t/p';

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg: ChatMessage = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const assistantMsg: ChatMessage = { role: 'assistant', text: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await api.chat(text.trim());
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      let movies: MovieSummary[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:movies')) {
            // Next data line has the movies JSON
            continue;
          }
          if (line.startsWith('event:done')) {
            continue;
          }
          if (line.startsWith('data:')) {
            const data = line.slice(5);
            // Try parsing as movie array
            try {
              const parsed = JSON.parse(data);
              if (Array.isArray(parsed)) {
                movies = parsed;
                continue;
              }
            } catch { /* not JSON, it's a text token */ }

            fullText += data;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', text: fullText, movies };
              return updated;
            });
          }
        }
      }

      // Final update with movies
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', text: fullText, movies };
        return updated;
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', text: 'Something went wrong. Try again!' };
        return updated;
      });
    }

    setStreaming(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center pt-20">
            <h2 className="text-2xl font-bold mb-2">🎬 Movie Discovery Chat</h2>
            <p className="text-zinc-400 mb-8">Describe what you're in the mood for</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl rounded-2xl px-4 py-3 ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-200'
            }`}>
              <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
              {msg.movies && msg.movies.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {msg.movies.map(m => (
                    <Link key={m.id} to={`/movie/${m.id}`} className="group">
                      {m.posterUrl ? (
                        <img src={`${TMDB_IMG}/w154${m.posterUrl}`} alt={m.title}
                          className="rounded w-full group-hover:ring-2 ring-blue-500 transition" />
                      ) : (
                        <div className="aspect-[2/3] rounded bg-zinc-700 flex items-center justify-center">
                          <span className="text-xs text-zinc-400">{m.title.slice(0, 10)}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 p-4">
        <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            placeholder="Describe what you want to watch..."
            disabled={streaming}
            className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 ring-blue-500" />
          <button type="submit" disabled={streaming || !input.trim()}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
