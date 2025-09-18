import { useNavigate } from 'react-router-dom'
import { 
  RiRobot2Fill, 
  RiShoppingBag3Line, 
  RiCustomerService2Line, 
  RiBarChartLine,
  RiShieldCheckLine,
  RiRocketLine,
  RiArrowRightLine,
  RiCheckLine
} from 'react-icons/ri'

const LandingPage = () => {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/login')
  }

  const features = [
    {
      icon: <RiRobot2Fill className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Sales Agents",
      description: "Create personalized AI sales representatives with custom personalities and communication styles"
    },
    {
      icon: <RiShoppingBag3Line className="w-8 h-8 text-green-600" />,
      title: "Shopify Integration",
      description: "Seamlessly connect your Shopify store and automatically sync product catalogs"
    },
    {
      icon: <RiCustomerService2Line className="w-8 h-8 text-purple-600" />,
      title: "24/7 Customer Support",
      description: "Provide instant, intelligent responses to customer inquiries around the clock"
    },
                                       {
         icon: <RiBarChartLine className="w-8 h-8 text-orange-600" />,
         title: "Increased Sales",
         description: "Boost conversions with intelligent product recommendations and personalized interactions"
       },
    {
      icon: <RiShieldCheckLine className="w-8 h-8 text-red-600" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with encrypted credentials and secure API integrations"
    },
    {
      icon: <RiRocketLine className="w-8 h-8 text-indigo-600" />,
      title: "Scalable Solution",
      description: "Grow your business with a platform that scales from small boutiques to large enterprises"
    }
  ]

  const stats = [
    { number: "24/7", label: "Customer Support" },
    { number: "100%", label: "Shopify Compatible" },
    { number: "AI-Powered", label: "Conversations" },
    { number: "Real-time", label: "Product Sync" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <RiRobot2Fill className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">Ryder Partners</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-800/90"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Your Shopify Store with
              <span className="text-blue-200"> AI-Powered Sales</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Boost sales, enhance customer experience, and provide 24/7 support with intelligent AI agents 
              that understand your products and engage customers like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold text-lg flex items-center justify-center group shadow-lg hover:shadow-xl"
              >
                Start Free Trial
                <RiArrowRightLine className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button className="border-2 border-white/30 text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-all duration-200 font-semibold text-lg backdrop-blur-sm">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI technology with seamless Shopify integration 
              to deliver exceptional customer experiences and drive sales growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect Your Store</h3>
              <p className="text-gray-600">
                Securely connect your Shopify store with our encrypted API integration
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create AI Agent</h3>
              <p className="text-gray-600">
                Customize your AI sales representative with personality and behavior settings
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Launch & Scale</h3>
              <p className="text-gray-600">
                Deploy your AI agent and watch your sales and customer satisfaction grow
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your E-commerce Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of successful Shopify stores already using AI to increase sales and delight customers.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-semibold text-lg flex items-center justify-center mx-auto group"
          >
            Get Started Now
            <RiArrowRightLine className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <RiRobot2Fill className="w-8 h-8 text-blue-400 mr-3" />
                <span className="text-xl font-bold">Ryder Partners</span>
              </div>
              <p className="text-gray-400">
                AI-powered sales solutions for modern e-commerce businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI Agents</li>
                <li>Shopify Integration</li>
                <li>Analytics</li>
                <li>API</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ryder Partners. All rights reserved. Powered by Cortechsols.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
