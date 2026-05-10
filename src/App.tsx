/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Play, 
  Trophy, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ArrowLeft, 
  Award,
  Sparkles,
  Gift,
  Search,
  Timer,
  Zap,
  Star
} from 'lucide-react';

// --- Types ---
type Screen = 'welcome' | 'menu' | 'memory' | 'quiz' | 'tap' | 'reward';

interface HighScores {
  memory: number;
  quiz: number;
  tap: number;
}

// --- Utils ---
const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
};

// --- Components ---

const FloatingHearts = () => {
  return (
    <div className="heart-bg overflow-hidden">
      {/* Design-specific background elements */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-blur-circle-1 rounded-full"></div>
      <div className="absolute bottom-[100px] right-[-100px] w-96 h-96 bg-blur-circle-2 rounded-full"></div>
      <div className="absolute top-20 right-40 opacity-20 transform rotate-12 hidden md:block">
        <Heart size={120} fill="#FF4D6D" className="text-primary" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] lg:text-[280px] font-black text-primary/5 leading-none pointer-events-none select-none tracking-tighter z-0">
        MOTHER
      </div>

      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: '110vh', 
            x: `${Math.random() * 100}vw`, 
            scale: Math.random() * 0.5 + 0.5,
            rotate: Math.random() * 360,
            opacity: 0
          }}
          animate={{ 
            y: '-10vh',
            x: `${(Math.random() - 0.5) * 20 + 50}vw`,
            rotate: Math.random() * 720,
            opacity: [0, 0.2, 0.2, 0]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className="absolute text-rose"
        >
          <Heart fill="currentColor" size={Math.random() * 40 + 20} />
        </motion.div>
      ))}
    </div>
  );
};

const RippleButton = ({ children, onClick, className, ...props }: any) => {
  const [ripples, setRipples] = useState<{ x: number, y: number, id: number }[]>([]);
  
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();
    
    setRipples([...ripples, { x, y, id }]);
    if (onClick) onClick(event);
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const timeout = setTimeout(() => {
        setRipples(ripples.slice(1));
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [ripples]);

  return (
    <button 
      className={`relative overflow-hidden ${className}`} 
      onClick={createRipple} 
      {...props}
    >
      {ripples.map(ripple => (
        <span 
          key={ripple.id} 
          className="ripple bg-white/20" 
          style={{ left: ripple.x, top: ripple.y, width: 20, height: 20, marginLeft: -10, marginTop: -10 }} 
        />
      ))}
      {children}
    </button>
  );
};

// --- Game Logic ---

const MemoryGame = ({ onWin, onBack }: { onWin: (score: number) => void, onBack: () => void }) => {
  const emojis = ['❤️', '🌸', '👩', '🎁', '💖', '🌷', '🧁', '💎'];
  const [cards, setCards] = useState<{ id: number, emoji: string, flipped: boolean, matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(shuffled);

    const int = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].emoji === cards[second].emoji) {
        setCards(prev => prev.map((card, i) => 
          (i === first || i === second) ? { ...card, matched: true } : card
        ));
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
      setMoves(m => m + 1);
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      const score = Math.max(10, 1000 - moves * 20 - timer);
      setTimeout(() => onWin(score), 1000);
    }
  }, [cards]);

  const handleFlip = (idx: number) => {
    if (flipped.length < 2 && !flipped.includes(idx) && !cards[idx].matched) {
      setFlipped([...flipped, idx]);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-sm mb-6">
        <button onClick={onBack} className="p-2 glass-card text-primary"><ArrowLeft /></button>
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-2 font-bold"><Timer size={18} /> {timer}s</div>
          <div className="glass-card px-4 py-2 flex items-center gap-2 font-bold">Moves: {moves}</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 max-w-sm">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFlip(i)}
            className={`w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center text-3xl cursor-pointer rounded-2xl transition-all duration-500 transform-gpu border-2
              ${card.flipped || flipped.includes(i) || card.matched 
                ? 'bg-white border-primary shadow-lg scale-100' 
                : 'bg-primary text-white border-transparent shadow-md'}`}
          >
            {(card.flipped || flipped.includes(i) || card.matched) ? card.emoji : <Heart fill="currentColor" opacity={0.6} />}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const QuizGame = ({ onWin, onBack }: { onWin: (score: number) => void, onBack: () => void }) => {
  const questions = [
    { q: "What is the most popular flower for Mother's Day?", a: ["Roses", "Carnations", "Tulips", "Lilies"], correct: 1 },
    { q: "Which country celebrated Mother's Day first?", a: ["USA", "Greece", "UK", "Egypt"], correct: 1 },
    { q: "What animal mother carries its young in a pouch?", a: ["Kangaroo", "Panda", "Elephant", "Whale"], correct: 0 },
    { q: "Mothers are like...", a: ["Stars", "Buttons", "Glue", "All of these"], correct: 3 },
    { q: "What date is Mother's Day 2026?", a: ["May 3", "May 10", "May 17", "May 24"], correct: 1 }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[currentIdx].correct) setScore(s => s + 20);
    
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(c => c + 1);
        setSelected(null);
      } else {
        onWin(score + (idx === questions[currentIdx].correct ? 20 : 0));
      }
    }, 800);
  };

  return (
    <div className="max-w-md w-full">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 glass-card text-primary"><ArrowLeft /></button>
        <div className="h-4 bg-white/30 flex-1 mx-4 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx + 0) / questions.length) * 100}%` }}
          />
        </div>
        <div className="glass-card px-4 py-2 font-bold">{score} pts</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="glass-card p-10 text-center"
        >
          <div className="text-sm uppercase tracking-[0.2em] font-black text-primary mb-4">Question {currentIdx + 1}</div>
          <h2 className="text-3xl font-black mb-8 leading-tight">{questions[currentIdx].q}</h2>
          <div className="grid gap-4">
            {questions[currentIdx].a.map((ans, i) => (
              <RippleButton
                key={i}
                onClick={() => handleSelect(i)}
                className={`py-5 rounded-3xl font-bold transition-all text-left px-8 text-lg border-2
                  ${selected === null ? 'bg-white/60 hover:bg-white border-white' : 
                    i === questions[currentIdx].correct ? 'bg-green-500 text-white border-green-500' : 
                    selected === i ? 'bg-primary text-white border-primary' : 'bg-white/40 border-transparent opacity-50'}`}
              >
                {ans}
              </RippleButton>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const TapGame = ({ onWin, onBack }: { onWin: (score: number) => void, onBack: () => void }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hearts, setHearts] = useState<{ id: number, x: number, y: number, type: 'normal' | 'gold' }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnHeart = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const type = Math.random() > 0.9 ? 'gold' : 'normal';
    const newHeart = {
      id: Date.now() + Math.random(),
      x: Math.random() * (rect.width - 80),
      y: Math.random() * (rect.height - 80),
      type: type as 'normal' | 'gold'
    };
    setHearts(h => [...h, newHeart]);
    
    setTimeout(() => {
      setHearts(h => h.filter(item => item.id !== newHeart.id));
    }, 1500);
  }, []);

  useEffect(() => {
    const spawnInt = setInterval(spawnHeart, 500);
    const timeInt = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => {
      clearInterval(spawnInt);
      clearInterval(timeInt);
    };
  }, [spawnHeart]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onWin(score);
    }
  }, [timeLeft, score, onWin]);

  const handleTap = (id: number, type: 'normal' | 'gold') => {
    setScore(s => s + (type === 'gold' ? 50 : 10));
    setHearts(h => h.filter(item => item.id !== id));
  };

  return (
    <div className="w-full h-[60vh] relative max-w-4xl" ref={containerRef}>
      <div className="absolute top-0 inset-x-0 flex justify-between z-20 px-4">
        <button onClick={onBack} className="p-2 glass-card text-primary"><ArrowLeft /></button>
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-2 font-bold"><Timer size={18} /> {timeLeft}s</div>
          <div className="glass-card px-4 py-2 font-black text-2xl bg-white text-primary px-6">{score}</div>
        </div>
      </div>

      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            onClick={() => handleTap(heart.id, heart.type)}
            className="absolute p-6 cursor-pointer drop-shadow-xl z-10"
            style={{ left: heart.x, top: heart.y }}
          >
            {heart.type === 'gold' ? (
              <div className="text-yellow-500 drop-shadow-xl scale-150"><Star fill="currentColor" size={40} /></div>
            ) : (
              <div className="text-primary drop-shadow-xl scale-125"><Heart fill="currentColor" size={40} /></div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [lastScore, setLastScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [highScores, setHighScores] = useLocalStorage<HighScores>('mom-love-fun-scores', { memory: 0, quiz: 0, tap: 0 });

  const handleWin = (game: 'memory' | 'quiz' | 'tap', score: number) => {
    setLastScore(score);
    if (score > highScores[game]) {
      setHighScores({ ...highScores, [game]: score });
    }
    setScreen('reward');
  };

  const totalHighScore = highScores.memory + highScores.quiz + highScores.tap;

  return (
    <div className="min-h-screen relative flex flex-col font-sans selection:bg-primary-light selection:text-white">
      <FloatingHearts />
      
      {/* Navigation Layer */}
      <nav className="z-20 flex justify-between items-center px-6 lg:px-12 py-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(255,77,109,0.3)]">
            <Heart size={20} fill="white" className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-dark-accent">MOM LOVE FUN</span>
        </div>
        
        <div className="flex space-x-4 items-center">
          <div className="bg-white/60 backdrop-blur-md px-5 py-2 rounded-full border border-white/80 shadow-sm hidden sm:block">
            <span className="text-[10px] uppercase font-black tracking-widest text-primary mr-2">High Score</span>
            <span className="text-lg font-black">{totalHighScore.toLocaleString()}</span>
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-transform"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 lg:px-12">
        <AnimatePresence mode="wait">
          
          {screen === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <div className="mb-10 flex flex-col md:flex-row items-end justify-between gap-8">
                <div>
                  <h1 className="text-[70px] sm:text-[110px] font-black leading-[0.85] text-primary tracking-tighter">
                    MOM<br/><span className="text-dark-accent">LOVE</span><br/>FUN
                  </h1>
                  <p className="mt-8 text-xl text-dark-accent/70 font-bold max-w-sm">
                    A luxurious collection of mini-games dedicated to the most special woman in your life.
                  </p>
                </div>
                <div className="text-right pb-4 w-full md:w-auto">
                  <RippleButton 
                    onClick={() => setScreen('menu')}
                    className="btn-primary w-full md:w-auto px-16 text-3xl"
                  >
                    PLAY NOW
                  </RippleButton>
                </div>
              </div>
            </motion.div>
          )}

          {screen === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-8 w-full grid-cols-1 md:grid-cols-3 max-w-6xl pb-20"
            >
              {[
                { id: 'memory', title: 'Memory Match', icon: '🧠', score: highScores.memory, desc: 'Test your focus by matching beautiful floral pairs.', num: '01' },
                { id: 'quiz', title: "Mother's Quiz", icon: '🌸', score: highScores.quiz, desc: 'How well do you know her favorite things?', num: '02' },
                { id: 'tap', title: 'Heart Tap', icon: '💘', score: highScores.tap, desc: 'Collect as many hearts as you can for Mom.', num: '03' },
              ].map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                  onClick={() => setScreen(item.id as Screen)}
                  className="group relative bg-white/40 backdrop-blur-xl border border-white p-10 rounded-[40px] shadow-xl hover:bg-white/60 transition-all cursor-pointer hover:-translate-y-2 overflow-hidden"
                >
                  <div className="absolute -top-6 left-8 text-7xl font-black text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none">
                    {item.num}
                  </div>
                  <div className="mb-8 w-16 h-16 bg-rose rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                    {item.icon}
                  </div>
                  <h3 className="text-3xl font-black mb-3">{item.title}</h3>
                  <p className="text-sm text-dark-accent/60 leading-relaxed mb-8 italic font-medium">
                    {item.desc}
                  </p>
                  
                  {item.id === 'memory' && (
                    <div className="flex gap-2">
                       {[...Array(3)].map((_, i) => (
                         <div key={i} className={`w-8 h-8 rounded-lg ${i === 2 ? 'border-2 border-primary flex items-center justify-center text-[10px] bg-rose/40' : 'bg-rose/20'}`}>
                           {i === 2 && '❤️'}
                         </div>
                       ))}
                    </div>
                  )}

                  {item.id === 'quiz' && (
                    <div className="h-2 w-full bg-rose/20 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-primary"></div>
                    </div>
                  )}

                  {item.id === 'tap' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <div className="w-3 h-3 rounded-full bg-primary/30"></div>
                    </div>
                  )}

                  <div className="mt-8 flex items-center gap-2 text-xs uppercase font-black tracking-widest text-primary bg-primary/5 w-fit px-4 py-2 rounded-full">
                    <Trophy size={14} /> BEST: {item.score}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Individual Game Screens - Wrapping in high-contrast containers */}
          {screen === 'memory' && (
            <motion.div key="memory" className="w-full pb-20">
              <MemoryGame 
                onWin={(score) => handleWin('memory', score)} 
                onBack={() => setScreen('menu')} 
              />
            </motion.div>
          )}

          {screen === 'quiz' && (
            <motion.div key="quiz" className="w-full flex justify-center pb-20">
              <QuizGame 
                onWin={(score) => handleWin('quiz', score)} 
                onBack={() => setScreen('menu')} 
              />
            </motion.div>
          )}

          {screen === 'tap' && (
            <motion.div key="tap" className="w-full h-full min-h-[60vh] flex items-center justify-center pb-20">
              <TapGame 
                onWin={(score) => handleWin('tap', score)} 
                onBack={() => setScreen('menu')} 
              />
            </motion.div>
          )}

          {screen === 'reward' && (
            <motion.div 
              key="reward"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center glass-card p-12 lg:p-20 max-w-2xl w-full relative overflow-hidden"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] font-black text-primary/5 uppercase leading-none pointer-events-none z-0">
                WINNER
              </div>
              
              <div className="relative z-10">
                <motion.div 
                  initial={{ y: 20 }} animate={{ y: 0 }}
                  className="bg-yellow-400 p-8 rounded-full shadow-2xl border-4 border-white inline-block mb-8"
                >
                  <Award size={64} className="text-white" />
                </motion.div>
                
                <h2 className="text-5xl font-black mb-4 tracking-tighter">SUCCESS!</h2>
                <div className="text-8xl font-black text-primary mb-8 drop-shadow-xl">{lastScore}</div>
                
                <p className="text-2xl text-dark-accent/70 font-bold mb-12 italic max-w-lg mx-auto">
                  "A mother is she who can take the place of all others but whose place no one else can take."
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <RippleButton 
                    onClick={() => setScreen('menu')}
                    className="flex-1 bg-white py-6 rounded-3xl font-black text-dark-accent text-xl border-4 border-rose"
                  >
                    BACK TO MENU
                  </RippleButton>
                  <RippleButton 
                    onClick={() => setScreen('welcome')}
                    className="flex-1 btn-primary py-6 rounded-3xl flex items-center justify-center gap-3 text-2xl"
                  >
                    <RotateCcw size={24} /> PLAY AGAIN
                  </RippleButton>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="relative z-20 h-16 bg-dark-accent flex flex-col sm:flex-row items-center justify-between px-6 lg:px-12 py-4">
        <span className="text-[10px] tracking-[0.3em] uppercase font-black text-rose/60">Mother's Day Limited Edition v2.0</span>
        
        <div className="flex items-center space-x-2">
          <span className="text-[10px] tracking-[0.3em] uppercase font-black text-white">Made With Love For Mom</span>
          <Heart size={12} fill="#FF4D6D" className="text-primary" />
        </div>
        
        <div className="flex items-center space-x-4 hidden lg:flex">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
          <span className="text-[10px] tracking-[0.3em] uppercase font-black text-white/40">Server Status: Online</span>
        </div>
      </footer>
    </div>
  );
}
