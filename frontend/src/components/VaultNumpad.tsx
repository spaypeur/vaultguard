import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VaultNumpadProps {
  onSubmit: (code: string) => void;
}

export default function VaultNumpad({ onSubmit }: VaultNumpadProps) {
  const [code, setCode] = useState<string>('');
  const [shiftMode, setShiftMode] = useState(false);
  const [symbolMode, setSymbolMode] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [threatDetected, setThreatDetected] = useState(false);

  const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'];

  const letterRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ];

  const symbolRows = [
    ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
    ['-', '_', '=', '+', '[', ']', '{', '}', '|', '\\'],
    [';', ':', '\'', '"', ',', '.', '<', '>', '/', '?'],
  ];

  const currentRows = symbolMode ? symbolRows : letterRows;
  const keyboardRows = [numberRow, ...currentRows];

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(code));
    // Simulate threat detection based on input patterns
    setThreatDetected(code.includes('123') || code.length > 20);
  }, [code]);

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setCode(prev => prev.slice(0, -1));
    } else if (key === '⇧') {
      setShiftMode(prev => !prev);
    } else if (key === '↵') {
      onSubmit(code);
      setCode('');
    } else {
      let char = key;
      if (!symbolMode && /[a-z]/.test(key)) {
        char = shiftMode ? key.toUpperCase() : key.toLowerCase();
      }
      setCode(prev => prev + char);
    }
  };

  const handleClear = () => {
    setCode('');
  };

  const handleSubmit = () => {
    onSubmit(code);
    setCode('');
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl bg-black/80 p-6 rounded-xl border border-cyan-500/30 backdrop-blur-xl">
      {/* Code Display and Strength Indicator */}
      <div className="mb-6">
        <div className="bg-black/50 p-4 rounded-lg border border-cyan-500/20">
          <div className="text-cyan-400 font-mono text-lg mb-2">
            {'*'.repeat(code.length)}
          </div>
          {code.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-mono">PASSWORD STRENGTH</span>
                <span className={`text-sm font-mono ${
                  passwordStrength < 25 ? 'text-red-400' :
                  passwordStrength < 50 ? 'text-yellow-400' :
                  passwordStrength < 75 ? 'text-green-400' : 'text-cyan-400'
                }`}>
                  {passwordStrength < 25 ? 'WEAK' :
                   passwordStrength < 50 ? 'FAIR' :
                   passwordStrength < 75 ? 'GOOD' : 'STRONG'}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    passwordStrength < 25 ? 'bg-red-500' :
                    passwordStrength < 50 ? 'bg-yellow-500' :
                    passwordStrength < 75 ? 'bg-green-500' : 'bg-cyan-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${passwordStrength}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>8+ chars</span>
                <span>Upper/Lower</span>
                <span>Numbers</span>
                <span>Symbols</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Grid */}
      <div className="grid grid-cols-11 gap-1 mb-4">
        {keyboardRows.map((row, rowIndex) =>
          row.map((key, keyIndex) => (
            <motion.button
              key={`${rowIndex}-${keyIndex}`}
              className="h-12 rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 border border-cyan-500/20 text-sm font-mono text-cyan-400 hover:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKey(key)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (rowIndex * 10 + keyIndex) * 0.01 }}
            >
              {key}
            </motion.button>
          ))
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between mb-4">
        <motion.button
          className="px-4 py-2 rounded-lg bg-gradient-to-b from-blue-900/50 to-blue-950/50 border border-blue-500/20 text-blue-400 font-mono hover:border-blue-500/50"
          whileTap={{ scale: 0.95 }}
          onClick={() => setShiftMode(!shiftMode)}
        >
          ⇧ SHIFT {shiftMode ? 'ON' : 'OFF'}
        </motion.button>
        <motion.button
          className="px-4 py-2 rounded-lg bg-gradient-to-b from-purple-900/50 to-purple-950/50 border border-purple-500/20 text-purple-400 font-mono hover:border-purple-500/50"
          whileTap={{ scale: 0.95 }}
          onClick={() => setSymbolMode(!symbolMode)}
        >
          {symbolMode ? 'ABC LETTERS' : '!@# SYMBOLS'}
        </motion.button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          className="h-16 rounded-lg bg-gradient-to-b from-red-900/50 to-red-950/50 border border-red-500/20 text-red-400 font-mono hover:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          whileTap={{ scale: 0.95 }}
          onClick={handleClear}
        >
          CLEAR
        </motion.button>
        <motion.button
          className="h-16 rounded-lg bg-gradient-to-b from-green-900/50 to-green-950/50 border border-green-500/20 text-green-400 font-mono hover:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
        >
          ENTER
        </motion.button>
      </div>

      {/* Security Indicators and Threat Alerts */}
      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-xs font-mono">
          <div className="flex items-center">
            <motion.div
              className={`w-2 h-2 rounded-full mr-2 ${threatDetected ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
              animate={threatDetected ? { scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 0.5, repeat: threatDetected ? Infinity : 0 }}
            />
            <span className={threatDetected ? 'text-red-400' : 'text-green-400'}>
              {threatDetected ? 'THREAT DETECTED' : 'SECURE CHANNEL'}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse mr-2" />
            <span className="text-cyan-400">QUANTUM ENCRYPTED</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-2" />
            <span className="text-purple-400">BIOMETRIC READY</span>
          </div>
        </div>

        {/* Threat Alert Banner */}
        {threatDetected && (
          <motion.div
            className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 flex items-center space-x-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.div
              className="w-4 h-4 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <div className="flex-1">
              <div className="text-red-400 font-mono text-sm font-bold">SECURITY ALERT</div>
              <div className="text-red-300 text-xs">Suspicious input pattern detected. Enhanced monitoring activated.</div>
            </div>
          </motion.div>
        )}

        {/* Keyboard Security Status */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
            <div className="text-cyan-400 text-xs">ANTI-KEYLOGGER</div>
            <div className="text-green-400">ACTIVE</div>
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
            <div className="text-cyan-400 text-xs">INPUT ENCRYPTION</div>
            <div className="text-green-400">LAYERED</div>
          </div>
          <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
            <div className="text-cyan-400 text-xs">MEMORY WIPE</div>
            <div className="text-green-400">ENABLED</div>
          </div>
        </div>
      </div>
    </div>
  );
}