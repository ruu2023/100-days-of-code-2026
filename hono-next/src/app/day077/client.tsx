"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle, RotateCcw, Keyboard, Info, ArrowRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// --- Types ---
type Mode = 'NORMAL' | 'INSERT';

interface Exercise {
  id: number;
  title: string;
  instruction: string;
  initialText: string[];
  goalText: string;
  hint: string;
}

// --- Exercises ---
const EXERCISES: Exercise[] = [
  {
    id: 1,
    title: "Movement Basics",
    instruction: "Use 'h', 'j', 'k', 'l' to move to the character 'X' and press 'x' to delete it.",
    initialText: ["console.log('Hello-X-World')"],
    goalText: "console.log('Hello--World')",
    hint: "l moves right, x deletes char. Make it match exactly."
  },
  {
    id: 2,
    title: "Deleting Lines",
    instruction: "Use 'dd' to delete the middle line.",
    initialText: ["const a = 1;", "delete me", "const b = 2;"],
    goalText: "const a = 1;\nconst b = 2;",
    hint: "dd deletes the current line"
  },
  {
    id: 3,
    title: "Change Word",
    instruction: "Use 'cw' to change 'Apple' to 'Banana'.",
    initialText: ["const fruit = 'Apple';"],
    goalText: "const fruit = 'Banana';",
    hint: "cw deletes word and enters INSERT mode"
  },
  {
    id: 4,
    title: "Append at End",
    instruction: "Use 'A' to add a semicolon at the end of the line.",
    initialText: ["const x = 10"],
    goalText: "const x = 10;",
    hint: "A moves to end of line and enters INSERT mode"
  },
  {
    id: 5,
    title: "Inner Word Change",
    instruction: "Use 'ciw' to change 'oldName' to 'newName'.",
    initialText: ["let oldName = 5;"],
    goalText: "let newName = 5;",
    hint: "ciw changes the entire word under cursor"
  },
  {
    id: 6,
    title: "Open New Line",
    instruction: "Use 'o' to add a new line below and type '// done'.",
    initialText: ["function test() {", "}"],
    goalText: "function test() {\n  // done\n}",
    hint: "o opens a new line below"
  }
];

export default function Day077Client() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lines, setLines] = useState<string[]>(EXERCISES[0].initialText);
  const [cursor, setCursor] = useState({ row: 0, col: 0 });
  const [mode, setMode] = useState<Mode>('NORMAL');
  const [keyBuffer, setKeyBuffer] = useState('');
  const [history, setHistory] = useState<string[][]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFinishedAll, setIsFinishedAll] = useState(false);
  
  const exercise = EXERCISES[currentIdx];

  // --- Helpers ---
  const saveHistory = useCallback((currentLines: string[]) => {
    setHistory(prev => [...prev.slice(-19), [...currentLines]]);
  }, []);

  const undo = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setLines(prev);
      setHistory(prevHistory => prevHistory.slice(0, -1));
    }
  }, [history]);

  const checkGoal = useCallback((currentLines: string[]) => {
    const text = currentLines.join('\n');
    if (text === exercise.goalText) {
      setIsSuccess(true);
    }
  }, [exercise.goalText]);

  const updateLines = useCallback((newLines: string[]) => {
    saveHistory(lines);
    setLines(newLines);
    checkGoal(newLines);
  }, [lines, saveHistory, checkGoal]);

  // --- Key Handlers ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isSuccess) return;

    if (mode === 'NORMAL') {
      handleNormalMode(e);
    } else {
      handleInsertMode(e);
    }
  }, [mode, isSuccess, lines, cursor, keyBuffer]);

  const handleNormalMode = (e: KeyboardEvent) => {
    const key = e.key;
    if (['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', 'i', 'a', 'o', 'O', 'A', 'I', 'x', 'd', 'c', 'u'].includes(key)) {
      e.preventDefault();
    }

    let newCursor = { ...cursor };
    let newLines = [...lines];
    let newMode = mode;
    let nextKeyBuffer = keyBuffer + key;

    // Movement
    if (key === 'h') newCursor.col = Math.max(0, cursor.col - 1);
    else if (key === 'l') newCursor.col = Math.min((lines[cursor.row]?.length || 1) - 1, cursor.col + 1);
    else if (key === 'j') {
      newCursor.row = Math.min(lines.length - 1, cursor.row + 1);
      newCursor.col = Math.min((lines[newCursor.row]?.length || 1) - 1, cursor.col);
    }
    else if (key === 'k') {
      newCursor.row = Math.max(0, cursor.row - 1);
      newCursor.col = Math.min((lines[newCursor.row]?.length || 1) - 1, cursor.col);
    }
    else if (key === 'w') {
      const line = lines[cursor.row];
      let c = cursor.col;
      while (c < line.length && /\w/.test(line[c])) c++;
      while (c < line.length && !/\w/.test(line[c])) c++;
      newCursor.col = Math.min(line.length - 1, c);
    }
    else if (key === 'b') {
      const line = lines[cursor.row];
      let c = cursor.col;
      if (c === 0) return;
      c--;
      while (c > 0 && !/\w/.test(line[c])) c--;
      while (c > 0 && /\w/.test(line[c - 1])) c--;
      newCursor.col = c;
    }
    else if (key === 'e') {
      const line = lines[cursor.row];
      let c = cursor.col;
      if (c < line.length - 1) c++;
      while (c < line.length && !/\w/.test(line[c])) c++;
      while (c < line.length - 1 && /\w/.test(line[c + 1])) c++;
      newCursor.col = Math.min(line.length - 1, c);
    }
    else if (key === '0') newCursor.col = 0;
    else if (key === '$') newCursor.col = Math.max(0, lines[cursor.row].length - 1);
    else if (key === 'G') {
      newCursor.row = lines.length - 1;
      newCursor.col = 0;
    }
    else if (nextKeyBuffer === 'gg') {
      newCursor.row = 0;
      newCursor.col = 0;
      nextKeyBuffer = '';
    }

    // Modes (Only if not in the middle of a command)
    else if (key === 'i' && !keyBuffer) setMode('INSERT');
    else if (key === 'I' && !keyBuffer) {
      newCursor.col = 0;
      setMode('INSERT');
    }
    else if (key === 'a' && !keyBuffer) {
      setMode('INSERT');
      newCursor.col = Math.min(lines[cursor.row].length, cursor.col + 1);
    }
    else if (key === 'A' && !keyBuffer) {
      setMode('INSERT');
      newCursor.col = lines[cursor.row].length;
    }
    else if (key === 'o' && !keyBuffer) {
      newLines.splice(cursor.row + 1, 0, "");
      newCursor.row++;
      newCursor.col = 0;
      setMode('INSERT');
      updateLines(newLines);
    }
    else if (key === 'O' && !keyBuffer) {
      newLines.splice(cursor.row, 0, "");
      newCursor.row = cursor.row;
      newCursor.col = 0;
      setMode('INSERT');
      updateLines(newLines);
    }

    // Edits
    else if (key === 'x' && !keyBuffer) {
      const line = lines[cursor.row];
      if (line.length > 0) {
        newLines[cursor.row] = line.slice(0, cursor.col) + line.slice(cursor.col + 1);
        newCursor.col = Math.min(newLines[cursor.row].length - 1, cursor.col);
        updateLines(newLines);
      }
    }
    else if (key === 'u' && !keyBuffer) {
      undo();
      return;
    }

    // Complex (Buffer)
    if (nextKeyBuffer === 'dd') {
      newLines.splice(cursor.row, 1);
      if (newLines.length === 0) newLines = [""];
      newCursor.row = Math.min(newLines.length - 1, cursor.row);
      newCursor.col = 0;
      updateLines(newLines);
      nextKeyBuffer = '';
    }
    else if (nextKeyBuffer === 'cw' || nextKeyBuffer === 'ciw') {
      // Find word bounds
      const line = lines[cursor.row];
      let start = cursor.col;
      // For ciw, we always find the word under the cursor
      while (start > 0 && /\w/.test(line[start - 1])) start--;
      let end = cursor.col;
      while (end < line.length && /\w/.test(line[end])) end++;
      
      newLines[cursor.row] = line.slice(0, start) + line.slice(end);
      newCursor.col = start;
      setMode('INSERT');
      updateLines(newLines);
      nextKeyBuffer = '';
    }
    else if (nextKeyBuffer === 'd' || nextKeyBuffer === 'c' || nextKeyBuffer === 'ci' || nextKeyBuffer === 'di') {
      // Wait for next key
    } else {
      nextKeyBuffer = '';
    }

    setCursor(newCursor);
    setKeyBuffer(nextKeyBuffer);
  };

  const handleInsertMode = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMode('NORMAL');
      setCursor(c => ({ ...c, col: Math.max(0, c.col - 1) }));
      return;
    }

    let newLines = [...lines];
    let newCursor = { ...cursor };

    if (e.key === 'Backspace') {
      const line = lines[cursor.row];
      if (cursor.col > 0) {
        newLines[cursor.row] = line.slice(0, cursor.col - 1) + line.slice(cursor.col);
        newCursor.col--;
      } else if (cursor.row > 0) {
        const prevLine = lines[cursor.row - 1];
        newCursor.row--;
        newCursor.col = prevLine.length;
        newLines[cursor.row - 1] = prevLine + line;
        newLines.splice(cursor.row, 1);
      }
      setLines(newLines);
      setCursor(newCursor);
      checkGoal(newLines);
    } else if (e.key === 'Enter') {
      const line = lines[cursor.row];
      newLines[cursor.row] = line.slice(0, cursor.col);
      newLines.splice(cursor.row + 1, 0, line.slice(cursor.col));
      newCursor.row++;
      newCursor.col = 0;
      setLines(newLines);
      setCursor(newCursor);
      checkGoal(newLines);
    } else if (e.key.length === 1) {
      const line = lines[cursor.row];
      newLines[cursor.row] = line.slice(0, cursor.col) + e.key + line.slice(cursor.col);
      newCursor.col++;
      setLines(newLines);
      setCursor(newCursor);
      checkGoal(newLines);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const resetExercise = () => {
    setLines(exercise.initialText);
    setCursor({ row: 0, col: 0 });
    setMode('NORMAL');
    setKeyBuffer('');
    setHistory([]);
    setIsSuccess(false);
  };

  const nextExercise = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < EXERCISES.length) {
      setCurrentIdx(nextIdx);
      setLines(EXERCISES[nextIdx].initialText);
      setCursor({ row: 0, col: 0 });
      setMode('NORMAL');
      setKeyBuffer('');
      setHistory([]);
      setIsSuccess(false);
    } else {
      setIsFinishedAll(true);
    }
  };

  if (isFinishedAll) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white font-mono flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-[#161b22] border border-white/10 rounded-3xl p-12 text-center space-y-6 shadow-2xl"
        >
          <div className="flex justify-center">
            <div className="p-6 bg-green-500/20 rounded-full">
              <CheckCircle className="text-green-500" size={80} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Vim Mastered!</h1>
            <p className="text-slate-400">You've completed all the challenges in the Vim Dojo. You're now ready for real-world editing.</p>
          </div>
          <Button 
            onClick={() => {
              setCurrentIdx(0);
              setLines(EXERCISES[0].initialText);
              setCursor({ row: 0, col: 0 });
              setMode('NORMAL');
              setIsFinishedAll(false);
              setIsSuccess(false);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg rounded-xl"
          >
            Start Over
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-300 font-mono p-4 flex flex-col items-center select-none">
      <div className="w-full max-w-4xl mt-12 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-800 rounded-lg">
              <Terminal className="text-blue-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Vim Dojo</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Day 077 Coding Practice</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {EXERCISES.map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full transition-all duration-500 ${i === currentIdx ? 'bg-blue-500 w-8' : i < currentIdx ? 'bg-green-500' : 'bg-slate-700'}`} 
              />
            ))}
          </div>
        </div>

        {/* Instruction Card */}
        <Card className="bg-[#161b22] border-white/5 overflow-hidden">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="mt-1">
              <Info className="text-blue-400" size={20} />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-semibold text-white">{exercise.title}</h2>
              <p className="text-slate-400">{exercise.instruction}</p>
              <div className="pt-2">
                <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-400/30 bg-blue-400/5">
                  Hint: {exercise.hint}
                </Badge>
              </div>
            </div>
            {isSuccess && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="flex flex-col items-center gap-2"
              >
                <CheckCircle className="text-green-500" size={40} />
                <Button onClick={nextExercise} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  Next <ArrowRight size={14} className="ml-1" />
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Editor Area */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-h-[300px] flex flex-col">
            
            {/* Window Controls */}
            <div className="bg-[#161b22] border-b border-white/5 px-4 py-2 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <Keyboard size={12} /> {mode} MODE
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-6 text-xl leading-relaxed font-mono relative overflow-auto">
              {lines.map((line, r) => (
                <div key={r} className="flex gap-6 group/line">
                  <div className="w-8 text-right text-slate-600 text-sm select-none pt-1">
                    {r + 1}
                  </div>
                  <div className="relative whitespace-pre">
                    {line.split('').map((char, c) => {
                      const isCursor = cursor.row === r && cursor.col === c;
                      return (
                        <span key={c} className="relative">
                          <span className={char === ' ' ? 'opacity-0' : ''}>{char}</span>
                          {isCursor && (
                            <motion.div 
                              layoutId="cursor"
                              className={`absolute inset-0 ${mode === 'NORMAL' ? 'bg-blue-500/80 w-full' : 'bg-green-400 w-0.5'} z-10`}
                              transition={{ duration: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                        </span>
                      );
                    })}
                    {/* End of line cursor */}
                    {cursor.row === r && cursor.col === line.length && (
                      <motion.div 
                        layoutId="cursor"
                        className={`inline-block h-6 ${mode === 'NORMAL' ? 'bg-blue-500/80 w-[1ch]' : 'bg-green-400 w-0.5'} align-middle`}
                        transition={{ duration: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    {line === "" && r !== cursor.row && <span className="text-slate-800 italic text-sm">~</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Status Line */}
            <div className={`px-4 py-1.5 flex items-center justify-between text-xs font-bold transition-colors duration-300 ${mode === 'NORMAL' ? 'bg-blue-600 text-white' : 'bg-green-600 text-black'}`}>
              <div className="flex items-center gap-4">
                <span>{mode}</span>
                <span className="opacity-70">-- {exercise.id}/{EXERCISES.length} --</span>
              </div>
              <div className="flex items-center gap-4">
                {keyBuffer && <span className="bg-black/20 px-2 rounded">{keyBuffer}</span>}
                <span>{cursor.row + 1}:{cursor.col + 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetExercise}
            className="border-white/10 hover:bg-white/5 text-slate-400"
          >
            <RotateCcw size={14} className="mr-2" /> Reset Exercise
          </Button>
        </div>

        {/* Cheat Sheet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 border-t border-white/5">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Movement</h3>
            <div className="text-[11px] space-y-1">
              <div className="flex justify-between border-b border-white/5 pb-1"><span>h j k l</span> <span className="text-blue-400">Left, Down, Up, Right</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span>w / b</span> <span className="text-blue-400">Next / Prev Word</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span>0 / $</span> <span className="text-blue-400">Line Start / End</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span>gg / G</span> <span className="text-blue-400">File Start / End</span></div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Editing</h3>
            <div className="text-[11px] space-y-1">
              <div className="flex justify-between border-b border-white/5 pb-1"><span>x</span> <span className="text-blue-400">Delete Char</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span>dd</span> <span className="text-blue-400">Delete Line</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span>cw / ciw</span> <span className="text-blue-400">Change Word</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span>u</span> <span className="text-blue-400">Undo</span></div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Modes</h3>
            <div className="text-[11px] space-y-1">
              <div className="flex justify-between border-b border-white/5 pb-1"><span>i / a</span> <span className="text-blue-400">Insert / Append</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span>I / A</span> <span className="text-blue-400">Line Start / End Append</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span>o / O</span> <span className="text-blue-400">Open Line Below / Above</span></div>
              <div className="flex justify-between border-b border-white/5 pb-1"><span>ESC</span> <span className="text-blue-400">Back to NORMAL Mode</span></div>
            </div>
          </div>
        </div>

        {/* Success Overlay */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 font-bold"
            >
              <CheckCircle size={24} />
              Exercise Complete!
              <Button onClick={nextExercise} variant="secondary" size="sm" className="ml-4 bg-white text-green-600 hover:bg-slate-100">
                Next Challenge
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
