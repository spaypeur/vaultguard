import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  CurrencyDollarIcon,
  EyeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import VaultDoor3D from '../components/VaultDoor3D';
import VaultNumpad from '../components/VaultNumpad';

export default function VaultLogin() {
  const navigate = useNavigate();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [threatLevel, setThreatLevel] = useState('LOW');
  const [biometricStatus, setBiometricStatus] = useState('READY');
  const [biometricProgress, setBiometricProgress] = useState(0);
  const [threatDetectionPulse, setThreatDetectionPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setEncryptionProgress(prev => (prev + 1) % 100);
      setBiometricProgress(prev => (prev + 2) % 100);
      setThreatDetectionPulse(prev => (prev + 5) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    setIsUnlocking(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - 3D Vault Animation */}
          <div className="order-2 lg:order-1">
            <div className="text-center mb-8">
              <motion.h1
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text mb-4"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                VAULTGUARD SECURE ACCESS
              </motion.h1>
              <motion.p
                className="text-gray-400 text-lg md:text-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Enter your advanced quantum-encrypted access code to proceed
              </motion.p>
            </div>

        <div className="relative">
          <VaultDoor3D onUnlock={handleUnlock} />
          <VaultNumpad onSubmit={(code) => {
            setIsUnlocking(true);
            // The VaultDoor3D component will handle the actual animation and auth
          }} />

          {/* Security Indicators */}
          <div className="absolute top-4 left-4 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-mono">FIREWALL ACTIVE</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-blue-400 text-sm font-mono">NEURAL SHIELD ENGAGED</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-cyan-400 text-sm font-mono">QUANTUM KEYS SYNCHED</span>
            </div>
          </div>

          {/* Biometric Authentication Indicators */}
          <div className="absolute top-4 right-4 space-y-4">
            <motion.div
              className="flex flex-col items-center space-y-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(168, 85, 247, 0.2)"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgb(168, 85, 247)"
                    strokeWidth="2"
                    strokeDasharray={`${biometricProgress}, 100`}
                  />
                </svg>
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center"
                  animate={{
                    scale: biometricStatus === 'SCANNING' ? [1, 1.2, 1] : 1,
                    opacity: biometricStatus === 'SCANNING' ? [1, 0.7, 1] : 1
                  }}
                  transition={{
                    duration: 2,
                    repeat: biometricStatus === 'SCANNING' ? Infinity : 0
                  }}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </div>
              <span className="text-purple-400 text-xs font-mono">FACE ID</span>
              <span className="text-purple-300 text-xs font-mono">{biometricProgress}%</span>
            </motion.div>

            <motion.div
              className="flex flex-col items-center space-y-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-center">
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(34, 197, 94, 0.2)"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="2"
                    strokeDasharray={`${Math.min(biometricProgress + 10, 100)}, 100`}
                  />
                </svg>
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"
                  animate={{
                    scale: biometricStatus === 'SCANNING' ? [1, 1.2, 1] : 1,
                    opacity: biometricStatus === 'SCANNING' ? [1, 0.7, 1] : 1
                  }}
                  transition={{
                    duration: 2,
                    repeat: biometricStatus === 'SCANNING' ? Infinity : 0
                  }}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </div>
              <span className="text-green-400 text-xs font-mono">FINGERPRINT</span>
              <span className="text-green-300 text-xs font-mono">{Math.min(biometricProgress + 10, 100)}%</span>
            </motion.div>
          </div>

          {/* Enhanced Biometric Scan Effect and Threat Detection */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-green-500/30"
              animate={{
                x: isUnlocking ? ['0%', '100%'] : '0%',
                opacity: isUnlocking ? [0.3, 1, 0.3] : 0.3
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: isUnlocking ? Infinity : 0
              }}
            />

            {/* Threat Detection Radar */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              animate={{ rotate: threatDetectionPulse }}
              transition={{ duration: 0.1, ease: "linear" }}
            >
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 border-2 border-yellow-500/10 rounded-full" />
                <div className="absolute inset-2 border border-yellow-500/20 rounded-full" />
                <div className="absolute inset-4 border border-yellow-500/30 rounded-full" />
                <motion.div
                  className="absolute top-0 left-1/2 w-0.5 h-32 bg-gradient-to-b from-yellow-500/0 to-yellow-500/50 transform -translate-x-1/2 origin-bottom"
                  animate={{ scaleY: [0, 1, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>

            {isUnlocking && (
              <>
                <motion.div
                  className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-cyan-500/20 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute top-1/3 right-1/4 w-24 h-24 border-2 border-purple-500/20 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
                <motion.div
                  className="absolute bottom-1/4 left-1/3 w-20 h-20 border-2 border-green-500/20 rounded-full"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                />
              </>
            )}
          </div>
        </div>

        {/* Security Status Dashboard */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            className="bg-gray-900/50 p-4 rounded-lg border border-cyan-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <motion.div
                className="w-3 h-3 bg-cyan-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-cyan-400 font-mono">QUANTUM ENCRYPTION</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${encryptionProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-xs font-mono text-cyan-300">KEY STRENGTH: 4096-bit</div>
              <div className="text-xs font-mono text-cyan-300">ALGORITHM: Kyber-1024</div>
            </div>
            <p className="text-gray-400 text-sm">
              {encryptionProgress}% - Key synchronization in progress • Post-quantum secure
            </p>
            <div className="flex justify-between text-xs font-mono text-cyan-400 mt-1">
              <span>ENTROPY: HIGH</span>
              <span>LATENCY: &lt;1ms</span>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-900/50 p-4 rounded-lg border border-purple-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <motion.div
                className="w-3 h-3 bg-purple-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-purple-400 font-mono">AI DEFENSE MATRIX</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  threatLevel === 'LOW' ? 'bg-green-500' :
                  threatLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className={`text-sm font-mono ${
                  threatLevel === 'LOW' ? 'text-green-400' :
                  threatLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  THREAT LEVEL: {threatLevel}
                </span>
              </div>
              <div className="text-xs font-mono text-purple-300">
                {Math.floor(threatDetectionPulse / 3.6)}°
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1 mb-2">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-purple-400 h-1 rounded-full"
                animate={{ width: `${Math.sin(threatDetectionPulse * Math.PI / 180) * 50 + 50}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-gray-400 text-sm">
              Neural networks actively monitoring for threats • {Math.floor(threatDetectionPulse)} scans/min
            </p>
          </motion.div>

          <motion.div
            className="bg-gray-900/50 p-4 rounded-lg border border-green-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-mono">ZERO TRUST SECURITY</span>
            </div>
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-3 h-3 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-blue-400 text-sm font-mono">
                CONTINUOUS VALIDATION
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Continuous validation of every digital interaction
            </p>
          </motion.div>

          <motion.div
            className="bg-gray-900/50 p-4 rounded-lg border border-orange-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <motion.div
                className="w-3 h-3 bg-orange-500 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-orange-400 font-mono">BIOMETRIC STATUS</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-green-400 text-sm font-mono">
                  {biometricStatus}
                </span>
              </div>
              <div className="text-xs font-mono text-orange-300">
                FACE: {biometricProgress}% • FINGER: {Math.min(biometricProgress + 10, 100)}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-xs font-mono text-green-400">FACE ID: ACTIVE</div>
              <div className="text-xs font-mono text-green-400">FINGERPRINT: ACTIVE</div>
            </div>
            <p className="text-gray-400 text-sm">
              Multi-factor biometric authentication ready • Continuous verification
            </p>
          </motion.div>
        </div>
      </div>

          {/* Right Side - Value Propositions */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Rotating Value Propositions */}
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-white mb-6"
                key={Math.floor(Date.now() / 5000) % 4} // Changes every 5 seconds
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {[
                  "Join 10,000+ Protected Investors",
                  "$2.4B+ in Assets Recovered",
                  "24/7 Dark Web Monitoring",
                  "Government-Certified Security Expert"
                ][Math.floor(Date.now() / 5000) % 4]}
              </motion.h2>
              
              <p className="text-gray-300 text-lg mb-8">
                The world's most advanced cryptocurrency security platform. 
                Protect your digital assets with military-grade encryption and AI-powered threat detection.
              </p>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <LockClosedIcon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-white font-semibold text-sm">256-bit Encryption</div>
                <div className="text-gray-400 text-xs">Military Grade</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <CheckBadgeIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-white font-semibold text-sm">SOC 2 Certified</div>
                <div className="text-gray-400 text-xs">Compliance Ready</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <GlobeAltIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-white font-semibold text-sm">GDPR Compliant</div>
                <div className="text-gray-400 text-xs">Privacy Protected</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <ShieldCheckIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-white font-semibold text-sm">Zero Trust</div>
                <div className="text-gray-400 text-xs">Architecture</div>
              </div>
            </motion.div>

            {/* Social Proof Ticker */}
            <motion.div
              className="bg-gray-900/30 border border-gray-700 rounded-lg p-6 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <UserGroupIcon className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold text-sm">LIVE ACTIVITY</span>
              </div>
              
              <motion.div
                className="space-y-3"
                animate={{ y: [0, -60, -120, -180, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-white font-medium">John D.</div>
                    <div className="text-gray-400 text-sm">recovered $1.2M last week</div>
                  </div>
                  <div className="text-green-400 font-bold">+$1.2M</div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-white font-medium">Sarah M.</div>
                    <div className="text-gray-400 text-sm">prevented $500K phishing attack</div>
                  </div>
                  <div className="text-blue-400 font-bold">PROTECTED</div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-white font-medium">Michael R.</div>
                    <div className="text-gray-400 text-sm">secured $2.8M portfolio</div>
                  </div>
                  <div className="text-purple-400 font-bold">SECURED</div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-white font-medium">Lisa K.</div>
                    <div className="text-gray-400 text-sm">recovered stolen NFTs worth $850K</div>
                  </div>
                  <div className="text-green-400 font-bold">+$850K</div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-white font-medium">David L.</div>
                    <div className="text-gray-400 text-sm">blocked dark web threat</div>
                  </div>
                  <div className="text-red-400 font-bold">BLOCKED</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Key Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div>
                <div className="text-2xl font-bold text-cyan-400">94.7%</div>
                <div className="text-gray-400 text-sm">Recovery Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">$2.4B+</div>
                <div className="text-gray-400 text-sm">Assets Secured</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-gray-400 text-sm">Monitoring</div>
              </div>
            </motion.div>

            {/* Quick Access Links */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
              >
                Create Secure Account
              </button>
              <div className="text-center">
                <button
                  onClick={() => navigate('/services/recovery')}
                  className="text-red-400 hover:text-red-300 text-sm underline"
                >
                  🚨 Emergency: Lost Crypto? Get Help Now
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes biometricScan {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(1000%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}