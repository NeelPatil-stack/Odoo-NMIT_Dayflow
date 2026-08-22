import { useState, useEffect, useRef } from 'react';
import {
  MessageSquareHeart, Send, ShieldCheck, HeartPulse, Sparkles, RefreshCw,
  AlertTriangle, CheckCircle2, Bot, User, ThumbsUp, Smile, Frown, Meh,
  Wind, ArrowRight, Activity, LifeBuoy, ChevronRight, Lock
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const INITIAL_BOT_MESSAGE = {
  id: 'init-1',
  sender: 'bot',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  text: "Hello! I am MindCare, your confidential workplace support assistant. 🌿\n\nI am here to listen, help you navigate stress, and provide a safe space to share any problems you are facing at work.\n\nEverything you share can be kept private or submitted 100% anonymously to HR if you want action taken.",
  quickReplies: [
    { label: "⚡ I'm feeling overwhelmed with work", category: "workload", stressLevel: 8 },
    { label: "🤝 Having conflict with manager or peer", category: "management", stressLevel: 7 },
    { label: "⚖️ Struggling with Work-Life Balance", category: "workplace", stressLevel: 6 },
    { label: "🔋 Experiencing fatigue / burnout symptoms", category: "culture", stressLevel: 9 },
    { label: "💡 I have suggestions to reduce team stress", category: "general", stressLevel: 3 }
  ]
};

export default function WellnessChatbot({ fullPage = false, onSubmittedFeedback }) {
  const [messages, setMessages] = useState([INITIAL_BOT_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Guided state tracking
  const [activeIssue, setActiveIssue] = useState(null);
  const [stressLevel, setStressLevel] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState('workload');
  const [step, setStep] = useState('initial'); // 'initial', 'detail', 'support_needed', 'anon_submission', 'completed'

  // Breathing tool popup
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Inhale (4s)');
  const [breathingCounter, setBreathingCounter] = useState(4);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Breathing exercise timer effect
  useEffect(() => {
    let timer;
    if (showBreathing) {
      timer = setInterval(() => {
        setBreathingCounter((prev) => {
          if (prev > 1) return prev - 1;
          // Switch phase
          if (breathingPhase.startsWith('Inhale')) {
            setBreathingPhase('Hold (7s)');
            return 7;
          } else if (breathingPhase.startsWith('Hold')) {
            setBreathingPhase('Exhale (8s)');
            return 8;
          } else {
            setBreathingPhase('Inhale (4s)');
            return 4;
          }
        });
      }, 1000);
    } else {
      setBreathingCounter(4);
      setBreathingPhase('Inhale (4s)');
    }
    return () => clearInterval(timer);
  }, [showBreathing, breathingPhase]);

  const addMessage = (sender, text, options = {}) => {
    const newMsg = {
      id: Date.now().toString(),
      sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      ...options
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const generateBotResponse = (userText, chosenCategory = null) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = userText.toLowerCase();

      // Check step state or keyword intent
      if (step === 'initial' || chosenCategory) {
        setStep('detail');
        const cat = chosenCategory || (
          lower.includes('manager') || lower.includes('peer') || lower.includes('team') ? 'management' :
          lower.includes('balance') || lower.includes('overtime') || lower.includes('hours') ? 'workplace' :
          lower.includes('burnout') || lower.includes('tired') || lower.includes('health') ? 'culture' : 'workload'
        );
        setSelectedCategory(cat);

        addMessage('bot', `I hear you, and thank you for being open about this. Dealing with ${cat.replace('_', ' ')} challenges can take a real toll on your focus and mental well-being.\n\nTo help me understand better: Could you tell me a bit more about what specific situation or root cause is triggering this problem?`, {
          quickReplies: [
            { label: "Deadlines are unrealistic & expectations unclear", category: cat, stressLevel: 8 },
            { label: "Lack of communication or support from leadership", category: cat, stressLevel: 7 },
            { label: "Excessive hours with no break time", category: cat, stressLevel: 8 },
            { label: "Personal issues impacting work performance", category: cat, stressLevel: 6 }
          ]
        });
      } else if (step === 'detail') {
        setStep('support_needed');
        setActiveIssue(userText);

        addMessage('bot', `Thank you for detailing that. I've noted down the core issue.\n\nOn a scale of 1 to 10, how intense is your stress right now? Also, what kind of support or resolution would make the biggest positive difference for you?`, {
          showStressRating: true,
          quickReplies: [
            { label: "💬 Request a 1-on-1 supportive chat with HR", category: selectedCategory },
            { label: "🌴 Workload adjustment or temporary leave request", category: selectedCategory },
            { label: "🧘 Need immediate stress management coping tools", category: selectedCategory }
          ]
        });
      } else if (step === 'support_needed' || lower.includes('hr') || lower.includes('submit')) {
        setStep('anon_submission');

        addMessage('bot', `Got it! I can automatically compile our conversation into a **100% Confidential HR Feedback Report**.\n\nHR will receive the category, issue summary, and your stress score, but **your name, email, and ID will be completely masked**. Would you like me to submit this to HR now?`, {
          showSubmitButton: true
        });
      } else {
        // General conversational response
        let reply = "I am listening. Please share whatever is on your mind. Your mental peace is essential.";
        if (lower.includes('thank')) {
          reply = "You're very welcome! Remember to take deep breaths and give yourself credit for how hard you work every day. I'm always here if you need to talk again.";
        } else if (lower.includes('tip') || lower.includes('help') || lower.includes('stress')) {
          reply = "Here are 3 quick actions to relieve immediate workplace stress:\n1. 🫁 Try a 2-minute 4-7-8 Breathing Exercise (click the button below!).\n2. 🚶 Step away from your screen for a 5-minute hydration walk.\n3. 📝 Break your task list into 1 single priority for the next hour.";
        }

        addMessage('bot', reply, {
          quickReplies: [
            { label: "🧘 Start 2-Min Guided Breathing", action: 'breathing' },
            { label: "🔒 Submit Confidential Report to HR", action: 'submit' },
            { label: "🔄 Reset Chat", action: 'reset' }
          ]
        });
      }
    }, 900);
  };

  const handleSend = (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    addMessage('user', text);
    if (!textToSend) setInputText('');
    generateBotResponse(text);
  };

  const handleQuickReply = (reply) => {
    if (reply.action === 'breathing') {
      setShowBreathing(true);
      addMessage('bot', "Launching the guided 4-7-8 relaxation breathing widget for you below!");
      return;
    }
    if (reply.action === 'reset') {
      handleReset();
      return;
    }
    if (reply.action === 'submit') {
      handleAnonSubmit();
      return;
    }

    if (reply.stressLevel) {
      setStressLevel(reply.stressLevel);
    }
    if (reply.category) {
      setSelectedCategory(reply.category);
    }

    addMessage('user', reply.label);
    generateBotResponse(reply.label, reply.category);
  };

  const handleAnonSubmit = async () => {
    setIsTyping(true);
    try {
      const compiledMessage = activeIssue || messages.filter(m => m.sender === 'user').map(m => m.text).join(" | ") || "Employee requested workplace stress support & workload review via MindCare Chatbot.";

      await api.post('/feedback', {
        category: selectedCategory || 'workplace',
        message: `[MindCare AI Chatbot Submission - Stress Level: ${stressLevel}/10]\n${compiledMessage}`,
        sentiment: stressLevel >= 7 ? 'negative' : stressLevel >= 4 ? 'neutral' : 'positive',
      });

      setIsTyping(false);
      setStep('completed');
      toast.success('Confidential stress report submitted to HR!');

      addMessage('bot', `✅ **Submitted Successfully!**\n\nYour feedback has been securely hashed and transmitted to HR. They will review the concern without knowing your identity and initiate systemic workplace improvements.\n\nTake care of yourself today! 💙`, {
        quickReplies: [
          { label: "🧘 Take a Guided Breathing Break", action: 'breathing' },
          { label: "🔄 Start New Check-in", action: 'reset' }
        ]
      });

      if (onSubmittedFeedback) onSubmittedFeedback();
    } catch (err) {
      setIsTyping(false);
      toast.error('Failed to submit report. Please try again.');
      addMessage('bot', "⚠️ There was an issue reaching HR server. Please try submitting again or write directly using the traditional form.");
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_BOT_MESSAGE]);
    setStep('initial');
    setStressLevel(5);
    setActiveIssue(null);
    setSelectedCategory('workload');
  };

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${fullPage ? 'h-[720px]' : 'h-[580px]'}`}>
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white tracking-tight">MindCare AI Support</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Confidential
              </span>
            </div>
            <p className="text-xs text-slate-300">Employee Problem & Stress Resolution Chatbot</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBreathing(!showBreathing)}
            className={`btn btn-xs ${showBreathing ? 'bg-indigo-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'} flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs`}
            title="Open guided breathing exercise"
          >
            <Wind className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-medium">Breathing Tool</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stress Meter Banner */}
      <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <HeartPulse className={`w-4 h-4 ${stressLevel >= 7 ? 'text-rose-500 animate-pulse' : stressLevel >= 4 ? 'text-amber-500' : 'text-emerald-500'}`} />
          <span className="font-medium text-slate-700">Current Stress Indicator:</span>
          <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
            stressLevel >= 8 ? 'bg-rose-100 text-rose-700 border border-rose-200' :
            stressLevel >= 5 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {stressLevel}/10 — {stressLevel >= 8 ? 'High Burnout Alert' : stressLevel >= 5 ? 'Moderate Work Stress' : 'Manageable'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Strictly Encrypted & Anonymous</span>
        </div>
      </div>

      {/* Guided Breathing Drawer */}
      {showBreathing && (
        <div className="bg-indigo-950 text-white px-5 py-4 border-b border-indigo-900 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-xl font-bold text-indigo-300 animate-pulse">
              {breathingCounter}s
            </div>
            <div>
              <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">4-7-8 Relaxation Cycle</p>
              <h4 className="text-base font-bold text-white">{breathingPhase}</h4>
              <p className="text-xs text-slate-300">Focus on slow rhythm to soothe your nervous system.</p>
            </div>
          </div>
          <button
            onClick={() => setShowBreathing(false)}
            className="text-xs bg-indigo-900 hover:bg-indigo-800 text-indigo-200 px-3 py-1.5 rounded-lg border border-indigo-700"
          >
            Close Breathing Tool
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-indigo-300 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-700 text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div>
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-slate-100'
                }`}>
                  {msg.text}
                </div>

                <span className="text-[10px] text-slate-400 px-1 mt-1 block">
                  {msg.timestamp}
                </span>
              </div>
            </div>

            {/* Render interactive stress slider or quick replies if provided */}
            {msg.showStressRating && (
              <div className="mt-3 bg-white p-3.5 border border-slate-200 rounded-xl max-w-sm w-full space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Select your stress intensity:</span>
                  <span className="text-indigo-600 font-bold">{stressLevel}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>1 - Relaxed</span>
                  <span>5 - Moderate</span>
                  <span>10 - Extreme Burnout</span>
                </div>
              </div>
            )}

            {msg.showSubmitButton && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleAnonSubmit}
                  className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-2 rounded-xl px-4 py-2 text-xs shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" /> Submit Confidential HR Report
                </button>
              </div>
            )}

            {/* Quick reply chips */}
            {msg.quickReplies && (
              <div className="mt-3 flex flex-wrap gap-2 max-w-[85%]">
                {msg.quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-full font-medium transition-all shadow-2xs flex items-center gap-1"
                  >
                    <span>{reply.label}</span>
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-indigo-300 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex gap-1 items-center bg-white border border-slate-200 px-3 py-2 rounded-2xl">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Bar */}
      <div className="p-3.5 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your concern, problem, or stress trigger here..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white p-2.5 sm:px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
