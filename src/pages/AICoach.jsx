import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Send, Loader2, Sparkles, Lightbulb, UtensilsCrossed, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { getDateString } from '@/lib/dateUtils';

const quickPrompts = [
  { icon: UtensilsCrossed, text: "What should I eat today?", color: "text-primary" },
  { icon: TrendingDown, text: "Why am I not losing weight?", color: "text-chart-2" },
  { icon: Lightbulb, text: "Give me nutrition tips", color: "text-chart-4" },
];

export default function AICoach() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const today = getDateString();

  const { data: todaysEntries = [] } = useQuery({
    queryKey: ['diary', today],
    queryFn: () => base44.entities.DiaryEntry.filter({ date: today }),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const totalCals = todaysEntries.reduce((s, e) => s + (e.calories || 0), 0);
    const totalP = todaysEntries.reduce((s, e) => s + (e.protein || 0), 0);
    const totalC = todaysEntries.reduce((s, e) => s + (e.carbs || 0), 0);
    const totalF = todaysEntries.reduce((s, e) => s + (e.fat || 0), 0);

    const context = `User context:
- Calorie goal: ${user?.calorie_goal || 2000} kcal
- Today's intake: ${totalCals} kcal, ${totalP}g protein, ${totalC}g carbs, ${totalF}g fat
- Foods eaten today: ${todaysEntries.map(e => e.food_name).join(', ') || 'nothing yet'}
- Goal weight: ${user?.goal_weight || 'not set'}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are NutriTrack AI Coach — a friendly, knowledgeable nutrition advisor. Keep answers concise and actionable. Use UK foods and measurements.

${context}

User question: ${text}`,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-heading">AI Coach</h1>
              <p className="text-[10px] text-muted-foreground">Your personal nutrition advisor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-lg mx-auto w-full">
        {messages.length === 0 && (
          <div className="space-y-4 pt-8">
            <div className="text-center">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-2" />
              <h2 className="font-bold font-heading">Hi there!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                I'm your AI nutrition coach. Ask me anything!
              </p>
            </div>
            <div className="space-y-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors text-left"
                  onClick={() => sendMessage(prompt.text)}
                >
                  <prompt.icon className={`w-4 h-4 ${prompt.color}`} />
                  <span className="text-sm">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <ReactMarkdown className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border bg-card/80 backdrop-blur-xl">
        <div className="flex gap-2 max-w-lg mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="rounded-xl bg-muted border-0"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          />
          <Button
            size="icon"
            className="rounded-xl shrink-0"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}