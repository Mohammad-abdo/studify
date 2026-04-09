import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, Trash2, Settings } from 'lucide-react';
import api from '../config/api';
import { useLanguage } from '../context/LanguageContext';

const STORAGE_KEY = 'chatbot_conversation';

export default function ChatWidget() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const lb = (ar, en) => (isRTL ? ar : en);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(() => localStorage.getItem('chatbot_convId') || null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [aiConfigured, setAiConfigured] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (conversationId) localStorage.setItem('chatbot_convId', conversationId);
  }, [conversationId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => scrollToBottom());
    return () => cancelAnimationFrame(id);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
      if (messages.length === 0) loadSuggestions();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const checkStatus = async () => {
    try {
      const res = await api.get('/chatbot/status');
      setAiConfigured(res.data?.data?.configured ?? false);
    } catch {
      setAiConfigured(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const res = await api.get('/chatbot/suggestions');
      if (res.data?.data) setSuggestions(res.data.data);
    } catch { /* ignore */ }
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;

    setInput('');
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: 'user', content: userMsg, time: Date.now() }]);
    setLoading(true);

    try {
      const res = await api.post('/chatbot/message', {
        message: userMsg,
        conversationId,
      });

      const data = res.data?.data;
      if (data) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, time: Date.now() }]);
        if (data.conversationId) setConversationId(data.conversationId);
      }
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === 'AI_NOT_CONFIGURED' || code === 'AI_INVALID_KEY') {
        setAiConfigured(false);
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      let errMsg;
      // Backend uses HTTP 503 (not 429) for OpenAI quota so axios does not auto-retry.
      if (code === 'AI_QUOTA_EXCEEDED') {
        errMsg = lb(
          'تم تجاوز حصة خدمة الذكاء الاصطناعي. يرجى شحن رصيد OpenAI من platform.openai.com',
          'AI quota exceeded. Please add credits at platform.openai.com/billing'
        );
      } else {
        errMsg = err.response?.data?.error?.message || lb('حدث خطأ، يرجى المحاولة لاحقاً', 'Something went wrong, please try again.');
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg, time: Date.now(), isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem('chatbot_convId');
    setShowSuggestions(true);
    loadSuggestions();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const sideOffset = { [isRTL ? 'left' : 'right']: '1.5rem' };

  return createPortal(
    <>
      {!isOpen && (
        <button
          type="button"
          aria-label={lb('فتح المساعد', 'Open assistant')}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 z-[100] w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-full shadow-2xl shadow-violet-500/30 flex items-center justify-center hover:shadow-violet-500/50 transition-all duration-200 hover:scale-110 active:scale-95"
          style={sideOffset}
        >
          <MessageCircle size={24} />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-black flex items-center justify-center">
              {messages.filter((m) => m.role === 'assistant').length}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lb('مساعد Studify', 'Studify Assistant')}
          className="fixed bottom-6 z-[100] w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl shadow-black/20 border border-slate-200/80 flex flex-col overflow-hidden transition-opacity duration-200"
          style={{
            ...sideOffset,
            height: 'min(600px, calc(100vh - 6rem))',
          }}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm">{lb('مساعد Studify', 'Studify Assistant')}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${aiConfigured === false ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                    <span className="text-white/70 text-[10px] font-bold">
                      {aiConfigured === false
                        ? lb('غير مفعّل', 'Not configured')
                        : aiConfigured === null
                          ? lb('جاري الاتصال...', 'Connecting...')
                          : lb('متصل الآن', 'Online now')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/10 rounded-xl flex items-center justify-center transition-all"
                    title={lb('مسح المحادثة', 'Clear chat')}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/10 rounded-xl flex items-center justify-center transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
              {aiConfigured === false && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center">
                    <Settings size={28} className="text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">{lb('خدمة الذكاء الاصطناعي غير مفعّلة', 'AI Service Not Configured')}</h4>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">
                      {lb(
                        'يرجى إضافة مفتاح OpenAI API في ملف .env الخاص بالسيرفر لتفعيل المساعد الذكي',
                        'Please set your OPENAI_API_KEY in the backend .env file to enable the AI assistant'
                      )}
                    </p>
                    <div className="mt-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                      <code className="text-[10px] text-slate-600 font-mono">OPENAI_API_KEY=sk-...</code>
                    </div>
                    <button
                      onClick={checkStatus}
                      className="mt-3 px-4 py-2 bg-violet-100 text-violet-700 rounded-xl text-[11px] font-bold hover:bg-violet-200 transition-colors"
                    >
                      {lb('إعادة المحاولة', 'Retry')}
                    </button>
                  </div>
                </div>
              )}

              {aiConfigured !== false && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl flex items-center justify-center">
                    <Sparkles size={28} className="text-violet-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">{lb('مرحباً! كيف أقدر أساعدك؟', 'Hi! How can I help you?')}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                      {lb('اسألني عن المنتجات، الأسعار، الطلبات، أو أي شيء آخر', 'Ask me about products, pricing, orders, or anything else')}
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={`${msg.role}-${msg.time}-${i}`} className={`flex gap-2.5 ${msg.role === 'user' ? (isRTL ? 'flex-row-reverse' : 'flex-row-reverse') : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'mr-auto' : ''}`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-md'
                          : msg.isError
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-slate-100 text-slate-800 rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p className={`text-[9px] text-slate-300 mt-1 font-bold ${msg.role === 'user' ? 'text-end' : 'text-start'}`}>
                      {formatTime(msg.time)}
                    </p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={14} className="text-slate-500" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-violet-500" />
                    <span className="text-[11px] text-slate-400 font-bold">{lb('جاري التفكير...', 'Thinking...')}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {aiConfigured !== false && showSuggestions && suggestions.length > 0 && messages.length === 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-[10px] font-bold transition-colors border border-violet-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            {aiConfigured !== false && (
              <div className="p-3 border-t border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-1 border border-slate-200 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={lb('اكتب رسالتك...', 'Type your message...')}
                    className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-800 placeholder:text-slate-400 font-medium py-2"
                    dir={isRTL ? 'rtl' : 'ltr'}
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:hover:shadow-none"
                  >
                    <Send size={14} className={isRTL ? 'rotate-180' : ''} />
                  </button>
                </div>
                <p className="text-[8px] text-slate-300 text-center mt-1.5 font-bold">
                  {lb('مدعوم بالذكاء الاصطناعي — قد تحتوي الإجابات على أخطاء', 'Powered by AI — responses may contain errors')}
                </p>
              </div>
            )}
        </div>
      )}
    </>,
    document.body
  );
}
