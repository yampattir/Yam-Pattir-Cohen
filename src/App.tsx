import React, { useState } from 'react';
import { LiveAssistant } from './components/LiveAssistant';
import { motion, AnimatePresence } from 'motion/react';
import { Info, ExternalLink, Linkedin, Mail, MessageSquare, ArrowRight } from 'lucide-react';

export default function App() {
  const [showAssistant, setShowAssistant] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const envApiKey = process.env.GEMINI_API_KEY || '';
  const activeApiKey = customApiKey || envApiKey;

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customApiKey.trim()) {
      setShowKeyInput(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">Y</div>
            <span className="font-semibold tracking-tight text-slate-900">Yam Pattir Cohen</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="https://www.pintzetta.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              Pintzetta <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {!activeApiKey && (
              <button 
                onClick={() => setShowKeyInput(true)}
                className="text-indigo-600 hover:text-indigo-700 font-bold"
              >
                Set API Key
              </button>
            )}
            <button 
              onClick={() => setShowAssistant(!showAssistant)}
              className="px-5 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
            >
              {showAssistant ? 'Close Assistant' : 'Talk to John'}
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* API Key Modal (for exported version) */}
      <AnimatePresence>
        {showKeyInput && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <h2 className="text-xl font-bold mb-2">Configure Gemini API Key</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                To use the voice assistant after exporting, you need to provide a Gemini API key. 
                You can get one from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Google AI Studio</a>.
              </p>
              <form onSubmit={handleKeySubmit} className="space-y-4">
                <input 
                  type="password"
                  placeholder="Enter your API Key"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  required
                />
                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                  >
                    Save Key
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowKeyInput(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold"
              >
                Fashion Business & Marketing
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]"
              >
                Building the future of <span className="text-indigo-600">Fashion Business.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-lg text-lg text-slate-600 leading-relaxed"
              >
                Yam Pattir Cohen is a Paris-based Fashion Business student and entrepreneur. 
                Specializing in marketing, e-commerce, and brand strategy for the modern era.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <button 
                onClick={() => {
                  if (!activeApiKey) {
                    setShowKeyInput(true);
                  } else {
                    setShowAssistant(true);
                  }
                }}
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 group"
              >
                Talk to my Assistant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-2 ml-4">
                <a href="https://www.linkedin.com/in/yam-pattir-cohen" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="mailto:Yampattir456@gmail.com" className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-12 pt-12 border-t border-slate-100"
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Education</h3>
                <p className="text-slate-900 font-medium">ESMOD Paris</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Founder</h3>
                <p className="text-slate-900 font-medium">Pinzetta Vintage</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Assistant Interface */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {showAssistant ? (
                <motion.div
                  key="assistant"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 10 }}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50"
                >
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span className="text-xs font-semibold text-slate-500">John Assistant</span>
                    </div>
                    <button 
                      onClick={() => setShowAssistant(false)}
                      className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                  <div className="p-2">
                    <LiveAssistant apiKey={activeApiKey} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="visual"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 group cursor-pointer"
                  onClick={() => {
                    if (!activeApiKey) {
                      setShowKeyInput(true);
                    } else {
                      setShowAssistant(true);
                    }
                  }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000" 
                    alt="Fashion Editorial" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${activeApiKey ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="text-xs font-bold text-slate-900">
                        {activeApiKey ? 'John is Online' : 'API Key Required'}
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50/50 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8 text-sm text-slate-500 font-medium">
            <span>© 2026 Yam Pattir Cohen</span>
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://www.linkedin.com/in/yam-pattir-cohen" className="text-slate-400 hover:text-indigo-600 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="mailto:Yampattir456@gmail.com" className="text-slate-400 hover:text-indigo-600 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
