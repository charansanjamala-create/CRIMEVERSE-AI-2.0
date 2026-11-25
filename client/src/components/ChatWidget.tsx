import { useState, useRef, useEffect } from 'react'
import { Cpu, X, Send, Minimize2, Maximize2, MessageSquare, AlertTriangle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { aiAPI } from '../api'
import { v4 as uuidv4 } from 'uuid'
import ReactMarkdown from 'react-markdown'

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date }

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `## Welcome to CrimeVerse Intelligence Assistant

I'm your AI investigation assistant. I can help you:
- **Summarize** case evidence and analysis results
- **Explain** risk indicators and network relationships
- **Suggest** investigation leads
- **Answer** questions about your active investigation

**Note**: All responses are AI-generated indicators requiring human review.

How can I assist your investigation today?`, timestamp: new Date() },
  ])
  const [sessionId] = useState(uuidv4())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isMinimized])

  const chatMutation = useMutation({
    mutationFn: (message: string) => aiAPI.chat({ message, sessionId }),
    onSuccess: (res) => {
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.message.content, timestamp: new Date() }])
    },
    onError: () => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I encountered an error processing your request. Please try again.', timestamp: new Date() }])
    },
  })

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return
    const msg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])
    chatMutation.mutate(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  if (!isOpen) {
    return (
      <button
        id="ai-chat-widget-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-cyber-lg transition-all duration-300 hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #2350ea, #7c3aed)', boxShadow: '0 0 24px rgba(59,109,245,0.4)' }}
      >
        <Cpu className="w-5 h-5 text-white" />
        <span className="text-sm font-semibold text-white">AI Assistant</span>
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col shadow-2xl rounded-2xl border border-cyber-600/30 overflow-hidden transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[500px]'} w-80 sm:w-96`}
      style={{ background: '#0d1525' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cyber-600/20 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(35,80,234,0.2), rgba(124,58,237,0.2))' }}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Cpu className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-sm font-bold text-white">CrimeVerse AI</div>
          <div className="text-[10px] text-cyber-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Intelligence Assistant • Demo Mode
          </div>
        </div>
        <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 text-slate-400 hover:text-white">
          {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
        <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-crimson-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Disclaimer */}
          <div className="px-3 py-2 bg-amber-600/5 border-b border-amber-600/20 flex-shrink-0">
            <p className="text-[10px] text-amber-400/80 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              AI-generated responses require human review
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${msg.role === 'user' ? 'bg-cyber-600 text-white' : 'bg-gradient-to-br from-cyber-500 to-purple-600 text-white'}`}>
                  {msg.role === 'user' ? 'U' : <Cpu className="w-3 h-3" />}
                </div>
                <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-cyber-600/20 text-slate-200 border border-cyber-600/30' : 'bg-slate-800/80 text-slate-300 border border-slate-700/50'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-xs max-w-none [&>*]:my-1 [&>h2]:text-xs [&>h2]:font-bold [&>h2]:text-slate-200 [&>ul]:pl-3 [&>ul>li]:text-xs [&>p]:text-xs [&>table]:text-[10px]">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyber-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-3 h-3 text-white" />
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 py-2">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-cyber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-3 py-2 border-t border-slate-800 flex-shrink-0 flex gap-1.5 flex-wrap">
            {['Why is this case high risk?', 'Summarize evidence', 'Suggest leads'].map(q => (
              <button key={q} onClick={() => { setInput(q); }} className="text-[10px] px-2 py-1 rounded-md bg-slate-800 text-slate-400 hover:text-cyber-400 hover:bg-slate-700 transition-colors border border-slate-700/50">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the investigation..."
                rows={1}
                className="flex-1 px-3 py-2 rounded-xl text-xs text-slate-200 placeholder-slate-600 resize-none outline-none transition-all"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(59,109,245,0.2)' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                className="p-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #2350ea, #7c3aed)' }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
