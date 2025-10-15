import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import SocialProof from '../components/SocialProof';
import TrustBadges from '../components/TrustBadges';
import ValuePropositions from '../components/ValuePropositions';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });

      if (data.success) {
        // Store auth data using Zustand store only
        setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);

        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Login failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-purple-900/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/3 to-purple-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Value Propositions Section */}
        <div className="flex-none px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <ValuePropositions variant="detailed" showFeatures={true} />
          </div>
        </div>

        {/* Main Login Section */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left Column - Social Proof */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="order-2 lg:order-1"
              >
                <SocialProof variant="full" />
              </motion.div>

              {/* Right Column - Login Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="order-1 lg:order-2"
              >
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-center mb-8"
                >
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 p-1"
                      >
                        <div className="bg-black rounded-full p-4">
                          <ShieldCheckIcon className="w-12 h-12 text-transparent" />
                        </div>
                      </motion.div>
                      <div className="relative bg-black rounded-full p-5">
                        <ShieldCheckIcon className="w-12 h-12 text-cyan-400" />
                      </div>
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                      VAULTGUARD
                    </span>
                  </h1>
                  <p className="text-gray-400 text-xl">Elite Crypto Security Platform</p>
                  <div className="mt-6 inline-flex items-center bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-green-400 text-sm font-mono tracking-wider">SECURE CONNECTION</span>
                  </div>
                </motion.div>

                {/* Enhanced Login Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="bg-gray-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl"
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Email Address
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 text-lg"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Password
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-4 bg-gray-800/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 text-lg"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors p-1"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-6 h-6" />
                          ) : (
                            <EyeIcon className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-black font-bold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                          Authenticating...
                        </div>
                      ) : (
                        'Access VaultGuard'
                      )}
                    </motion.button>
                  </form>

                  {/* Enhanced Footer Links */}
                  <div className="mt-8 text-center space-y-4">
                    <Link
                      to="/register"
                      className="inline-block text-cyan-400 hover:text-cyan-300 transition-colors text-lg font-medium"
                    >
                      Don't have an account? <span className="font-semibold underline decoration-cyan-400/50 decoration-2 underline-offset-2">Create Account</span>
                    </Link>
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span>Military-grade encryption</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
                        <span>Zero-knowledge architecture</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Trust Badges Section */}
        <div className="flex-none px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <TrustBadges variant="detailed" showAnimations={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
