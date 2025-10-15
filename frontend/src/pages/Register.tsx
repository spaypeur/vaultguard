import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import CyberpunkCard from '../components/CyberpunkCard';
import SocialProof from '../components/SocialProof';
import TrustBadges from '../components/TrustBadges';
import ValuePropositions from '../components/ValuePropositions';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    jurisdiction: 'US',
    portfolioSize: '',
    investorType: 'individual',
    referralSource: '',
    agreedToTerms: false,
    agreedToPrivacy: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [step, setStep] = useState(1);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/\d/)) strength += 25;
    if (password.match(/[^a-zA-Z\d]/)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!formData.agreedToTerms || !formData.agreedToPrivacy) {
      toast.error('Please agree to the terms and privacy policy');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', formData);

      if (data.success) {
        setAuth(data.data.user, data.data.accessToken);
        localStorage.setItem('vaultguard-auth', JSON.stringify({
          state: {
            user: data.data.user,
            accessToken: data.data.accessToken,
            isAuthenticated: true
          },
          version: 0
        }));

        toast.success('Welcome to VaultGuard! Initializing your security dashboard...');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // If backend is not available, show helpful message
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Backend service unavailable. Please deploy your backend first.', {
          duration: 8000,
        });
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        toast.error('Cannot connect to backend. Please check your API_URL configuration.', {
          duration: 8000,
        });
      } else {
        toast.error(error.response?.data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const portfolioSizes = [
    { value: 'under-100k', label: 'Under $100K' },
    { value: '100k-1m', label: '$100K - $1M' },
    { value: '1m-10m', label: '$1M - $10M' },
    { value: '10m-100m', label: '$10M - $100M' },
    { value: 'over-100m', label: 'Over $100M' },
  ];

  const investorTypes = [
    { value: 'individual', label: 'Individual Investor' },
    { value: 'family-office', label: 'Family Office' },
    { value: 'institution', label: 'Institution' },
    { value: 'fund', label: 'Investment Fund' },
  ];

  const jurisdictions = [
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'EU', label: 'European Union' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'SG', label: 'Singapore' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_70%_30%,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>

      <div className="relative min-h-screen flex flex-col">
        {/* Header Section with Social Proof */}
        <div className="flex-none px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <ShieldCheckIcon className="w-20 h-20 text-cyan-400" />
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl"></div>
                </motion.div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Elite Access
                </span>
                <br />
                <span className="text-white">Registration</span>
              </h1>
              <p className="text-gray-400 text-xl mb-8">
                Join the world's most advanced crypto security platform
              </p>

              {/* Compact Social Proof for Register Page */}
              <SocialProof variant="compact" />
            </motion.div>
          </div>
        </div>

        {/* Main Registration Section */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column - Value Propositions */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-1 order-2 lg:order-1"
              >
                <ValuePropositions variant="compact" showFeatures={false} />
              </motion.div>

               {/* Center Column - Registration Form */}
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.4 }}
                 className="lg:col-span-2 order-1 lg:order-2"
               >
                 {/* Progress Indicator */}
                 <div className="flex justify-center mb-8">
                   <div className="flex space-x-4">
                     {[1, 2, 3].map((stepNum) => (
                       <div key={stepNum} className="flex items-center">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                           step >= stepNum
                             ? 'bg-cyan-500 border-cyan-500 text-black'
                             : 'border-gray-600 text-gray-400'
                         }`}>
                           {step > stepNum ? (
                             <CheckCircleIcon className="w-5 h-5" />
                           ) : (
                             stepNum
                           )}
                         </div>
                         {stepNum < 3 && (
                           <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                             step > stepNum ? 'bg-cyan-500' : 'bg-gray-600'
                           }`}></div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               </motion.div>
             </div>

             {/* Registration Form - Full Width */}
             <motion.div
               key={step}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="lg:col-span-3"
             >
            <CyberpunkCard glowColor="cyan" className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <UserIcon className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                      <h3 className="text-xl font-bold text-white">Personal Information</h3>
                      <p className="text-gray-400">Tell us about yourself</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                          placeholder="Create a strong password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Password Strength</span>
                            <span>{passwordStrength}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                passwordStrength < 50 ? 'bg-red-500' :
                                passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${passwordStrength}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Investment Profile */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <CurrencyDollarIcon className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                      <h3 className="text-xl font-bold text-white">Investment Profile</h3>
                      <p className="text-gray-400">Help us customize your experience</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio Size</label>
                      <select
                        value={formData.portfolioSize}
                        onChange={(e) => setFormData({ ...formData, portfolioSize: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        required
                      >
                        <option value="">Select portfolio size</option>
                        {portfolioSizes.map((size) => (
                          <option key={size.value} value={size.value}>{size.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Investor Type</label>
                      <select
                        value={formData.investorType}
                        onChange={(e) => setFormData({ ...formData, investorType: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        required
                      >
                        {investorTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Jurisdiction</label>
                      <div className="relative">
                        <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={formData.jurisdiction}
                          onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                          required
                        >
                          {jurisdictions.map((jurisdiction) => (
                            <option key={jurisdiction.value} value={jurisdiction.value}>{jurisdiction.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">How did you hear about us? (Optional)</label>
                      <input
                        type="text"
                        value={formData.referralSource}
                        onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                        placeholder="e.g., Google, referral, conference"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Terms & Confirmation */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <CheckCircleIcon className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                      <h3 className="text-xl font-bold text-white">Final Step</h3>
                      <p className="text-gray-400">Review and confirm your registration</p>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Portfolio Size:</span>
                        <span className="text-white">{portfolioSizes.find(s => s.value === formData.portfolioSize)?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white">{investorTypes.find(t => t.value === formData.investorType)?.label}</span>
                      </div>
                    </div>

                    {/* Terms and Privacy */}
                    <div className="space-y-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreedToTerms}
                          onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                          className="mt-1 w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                          required
                        />
                        <span className="text-sm text-gray-300">
                          I agree to the <Link to="/terms" className="text-cyan-400 hover:text-cyan-300">Terms of Service</Link> and understand that VaultGuard provides elite security services with no guarantees of investment returns.
                        </span>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreedToPrivacy}
                          onChange={(e) => setFormData({ ...formData, agreedToPrivacy: e.target.checked })}
                          className="mt-1 w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                          required
                        />
                        <span className="text-sm text-gray-300">
                          I agree to the <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link> and consent to the processing of my personal data for security services.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black rounded-lg font-bold transition-all duration-200 ${
                      step === 1 ? 'ml-auto' : ''
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Creating Account...' : step === 3 ? 'Create Account' : 'Continue'}
                  </button>
                </div>
              </form>
            </CyberpunkCard>
          </motion.div>

          {/* Enhanced Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline decoration-cyan-400/50 decoration-2 underline-offset-2">
                Sign In
              </Link>
            </p>
         </motion.div>
         </div>
       </div>

       {/* Trust Badges Section */}
       <div className="flex-none px-4 py-8">
         <div className="max-w-4xl mx-auto">
           <TrustBadges variant="compact" showAnimations={false} />
         </div>
       </div>
     </div>
   </div>
 );
}
