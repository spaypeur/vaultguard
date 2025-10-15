import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheckIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from '../components/CyberpunkCard';

export default function Blog() {
  const navigate = useNavigate();

  const featuredPost = {
    id: 1,
    title: "The $2.3B Crypto Heist: How I Tracked Funds Through 15 Mixers",
    excerpt: "A detailed breakdown of the largest crypto recovery operation of 2024. Learn the forensic techniques used to trace stolen Bitcoin through multiple privacy layers.",
    content: "In March 2024, I was contacted by a major crypto exchange after hackers stole $2.3 billion in Bitcoin...",
    author: "VaultGuard Expert",
    date: "2024-10-10",
    readTime: "12 min read",
    category: "Case Study",
    image: "/api/placeholder/800/400",
    tags: ["Bitcoin", "Forensics", "Recovery", "Dark Web"],
    featured: true,
  };

  const blogPosts = [
    {
      id: 2,
      title: "Dark Web Monitoring: Inside the Underground Crypto Markets",
      excerpt: "An exclusive look into how stolen crypto is traded on dark web marketplaces and how we monitor these channels 24/7.",
      author: "VaultGuard Expert",
      date: "2024-10-08",
      readTime: "8 min read",
      category: "Intelligence",
      tags: ["Dark Web", "Monitoring", "Intelligence"],
    },
    {
      id: 3,
      title: "New Phishing Campaign Targets MetaMask Users",
      excerpt: "Alert: Sophisticated phishing attacks are targeting MetaMask users with fake transaction approvals. Here's how to protect yourself.",
      author: "VaultGuard Expert",
      date: "2024-10-05",
      readTime: "5 min read",
      category: "Threat Alert",
      tags: ["Phishing", "MetaMask", "Security"],
    },
    {
      id: 4,
      title: "Blockchain Forensics: Following the Money Trail",
      excerpt: "Advanced techniques for tracking cryptocurrency transactions across multiple blockchains and privacy protocols.",
      author: "VaultGuard Expert",
      date: "2024-10-03",
      readTime: "15 min read",
      category: "Technical",
      tags: ["Blockchain", "Forensics", "Analysis"],
    },
    {
      id: 5,
      title: "Government Clearance: Why It Matters in Crypto Security",
      excerpt: "How my government security clearances provide unique advantages in crypto recovery and threat intelligence operations.",
      author: "VaultGuard Expert",
      date: "2024-09-28",
      readTime: "6 min read",
      category: "Expertise",
      tags: ["Government", "Clearance", "Security"],
    },
    {
      id: 6,
      title: "The Psychology of Crypto Scammers",
      excerpt: "After 20+ years in cybersecurity, I've learned how scammers think. Here's how to stay one step ahead.",
      author: "VaultGuard Expert",
      date: "2024-09-25",
      readTime: "10 min read",
      category: "Analysis",
      tags: ["Psychology", "Scams", "Prevention"],
    },
  ];

  const categories = [
    { name: "All Posts", count: blogPosts.length + 1 },
    { name: "Case Studies", count: 3 },
    { name: "Threat Alerts", count: 2 },
    { name: "Technical", count: 4 },
    { name: "Intelligence", count: 2 },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                VaultGuard Intelligence
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Exclusive insights from 20+ years of cybersecurity expertise. Real cases, real threats, real solutions.
            </p>
            <div className="mt-8 inline-flex items-center bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-400 text-sm font-mono">UPDATED DAILY</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <CyberpunkCard glowColor="cyan" variant="glass" className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="order-2 lg:order-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-mono">
                      FEATURED
                    </div>
                    <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-mono">
                      {featuredPost.category}
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{featuredPost.date}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
                  >
                    Read Full Case Study
                    <ArrowRightIcon className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-xl p-8 h-full flex items-center justify-center">
                    <div className="text-center">
                      <ShieldCheckIcon className="w-24 h-24 text-cyan-400 mx-auto mb-4" />
                      <div className="text-4xl font-bold text-white mb-2">$2.3B</div>
                      <div className="text-cyan-400 font-mono">RECOVERED</div>
                    </div>
                  </div>
                </div>
              </div>
            </CyberpunkCard>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-cyan-500/50 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                {category.name} ({category.count})
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <CyberpunkCard glowColor="purple" className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-mono ${
                        post.category === 'Threat Alert' ? 'bg-red-500/20 text-red-400' :
                        post.category === 'Technical' ? 'bg-blue-500/20 text-blue-400' :
                        post.category === 'Intelligence' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {post.category}
                      </div>
                      {post.category === 'Threat Alert' && (
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 mb-4 flex-grow leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                      <span>{post.date}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mt-auto"
                    >
                      Read More
                      <ArrowRightIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <CyberpunkCard glowColor="cyan" variant="glass">
              <div className="text-center py-8">
                <EyeIcon className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Stay Ahead of Threats
                </h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                  Get exclusive threat intelligence, case studies, and security insights delivered to your inbox. 
                  Join 10,000+ security professionals who trust VaultGuard Intelligence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold px-6 py-3 rounded-lg transition-all duration-200"
                  >
                    Subscribe
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  No spam. Unsubscribe anytime. Your email is protected with military-grade encryption.
                </p>
              </div>
            </CyberpunkCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
}