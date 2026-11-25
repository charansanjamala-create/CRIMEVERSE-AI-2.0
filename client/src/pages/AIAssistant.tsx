import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiAPI } from '../api'
import { Cpu, Send, AlertTriangle, RefreshCw } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import ReactMarkdown from 'react-markdown'

interface Msg { role: 'user' | 'assistant'; content: string }

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: `# CrimeVerse AI Intelligence Assistant

I'm your **AI-powered investigation assistant**. I can help you:

- **Analyze** evidence from any intelligence module
- **Correlate** patterns across Voice, Email, Identity, and Blockchain data
- **Explain** risk indicators and network relationships  
- **Suggest** investigation leads and next steps
- **Generate** investigation summaries

Ask me anything about your investigations!

> ⚠️ All responses are AI-generated indicators requiring human expert review.` }
  ])
  const [input, setInput] = useState('')
  const [sessionId] = useState(uuidv4())

  const chatMutation = useMutation({
    mutationFn: (msg: string) => aiAPI.chat({ message: msg, sessionId }),
    onSuccess: (res) => setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.message.content }]),
    onError: () => setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing request. Please try again.' }]),
  })

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return
    const msg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    chatMutation.mutate(msg)
  }

  const quickPrompts = [
    'What are the top risk indicators I should investigate?',
    'Explain the relationship between phishing emails and cryptocurrency fraud',
    'How do I identify voice cloning attacks?',
    'What is blockchain layering and how is it detected?',
    'Summarize Operation Phoenix case',
    'What are the key red flags in the email analyses?',
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in">
      <div className="page-header mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <h1 className="page-title">AI Intelligence Assistant</h1>
          </div>
          <p className="page-subtitle">CrimeVerse AI Core — Cross-module investigation intelligence</p>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="btn-secondary text-sm"><RefreshCw className="w-4 h-4" /> New Session</button>
      </div>

      <div className="ai-disclaimer mb-4">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        AI responses are investigative indicators only. Require human expert review. Not legal evidence.
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickPrompts.map(p => (
          <button key={p} onClick={() => { setInput(p); }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-cyber-400 hover:border-cyber-600/30 transition-all">
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${msg.role === 'user' ? 'bg-cyber-600 text-white' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'}`}>
              {msg.role === 'user' ? 'U' : <Cpu className="w-4 h-4" />}
            </div>
            <div className={`flex-1 max-w-3xl ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
              <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-cyber-600/20 border border-cyber-600/30 text-slate-200' : 'bg-slate-800/80 border border-slate-700/50 text-slate-300'}`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-xs [&>ul]:text-sm [&>blockquote]:text-xs [&>blockquote]:italic [&>table]:text-xs">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Cpu className="w-4 h-4 text-white" /></div>
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-cyber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-cyber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-cyber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-500 ml-2">Analyzing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Ask about your investigation, request analysis, or get AI insights..."
          rows={2}
          className="flex-1 input resize-none text-sm"
        />
        <button onClick={handleSend} disabled={!input.trim() || chatMutation.isPending} className="btn-primary px-5 self-end">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
