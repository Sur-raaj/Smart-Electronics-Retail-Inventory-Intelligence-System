import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin, FiArrowRight, FiCreditCard, FiTruck, FiShield, FiHeadphones } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      {/* Features Bar */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over $50' },
              { icon: FiShield, title: 'Secure Payment', desc: '100% protected' },
              { icon: FiCreditCard, title: 'Easy Returns', desc: '30-day returns' },
              { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated support' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-600/20 to-secondary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="text-lg sm:text-xl text-primary-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-xs sm:text-sm">{feature.title}</h4>
                  <p className="text-gray-500 text-xs hidden sm:block">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-5 group">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/30 transition-all">
                <span className="text-white font-bold text-xl">TG</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Tech</span>
                <span className="text-2xl font-bold text-primary-400">Gear</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Your premium destination for cutting-edge technology. We bring you the best gadgets with unmatched quality and competitive prices.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: FiFacebook, href: '#', label: 'Facebook' },
                { icon: FiTwitter, href: '#', label: 'Twitter' },
                { icon: FiInstagram, href: '#', label: 'Instagram' },
                { icon: FiYoutube, href: '#', label: 'YouTube' },
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-primary-600 hover:to-secondary-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <social.icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5 flex items-center">
              <span className="w-1 h-5 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full mr-3"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'All Products', path: '/products' },
                { name: 'Laptops', path: '/products?category=Laptops' },
                { name: 'SmartPhones', path: '/products?category=Phones' },
                { name: 'Tablets', path: '/products?category=Tablets' },
                { name: 'Cameras', path: '/products?category=Cameras' },
                { name: 'Audio', path: '/products?category=Audio' },
                { name: 'Smart Home', path: '/products?category=Smart Home' },
                { name: 'Drones', path: '/products?category=Drones' },
                { name: 'Headphones', path: '/products?category=Headphones' },
                { name: 'Gaming Gear', path: '/products?category=Gaming Gear' },
                { name: 'Accessories', path: '/products?category=Accessories' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm flex items-center group"
                  >
                    <FiArrowRight className="mr-2 text-xs opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5 flex items-center">
              <span className="w-1 h-5 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full mr-3"></span>
              Customer Service
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Contact Us', path: '/contact' },
                { name: 'FAQ', path: '/faq' },
                { name: 'Shipping Info', path: '/shipping' },
                { name: 'Returns & Exchanges', path: '/returns' },
                { name: 'Warranty', path: '/warranty' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm flex items-center group"
                  >
                    <FiArrowRight className="mr-2 text-xs opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info & Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5 flex items-center">
              <span className="w-1 h-5 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full mr-3"></span>
              Get In Touch
            </h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiMapPin className="text-primary-400 text-sm" />
                </div>
                <span className="text-gray-400 text-sm">123 Tech Street, Digital City, TC 12345</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiPhone className="text-primary-400 text-sm" />
                </div>
                <a href="tel:+15551234567" className="text-gray-400 text-sm hover:text-primary-400 transition-colors">+1 (555) 123-4567</a>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMail className="text-primary-400 text-sm" />
                </div>
                <a href="mailto:support@techgear.com" className="text-gray-400 text-sm hover:text-primary-400 transition-colors">support@techgear.com</a>
              </li>
            </ul>

            {/* Newsletter Mini */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="text-white text-sm font-medium mb-2">Subscribe to Newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-l-lg text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-r-lg hover:from-primary-700 hover:to-primary-800 transition-all">
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              © {currentYear} TechGear. All rights reserved. Crafted with ❤️
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link to="/privacy" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-500 hover:text-primary-400 text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
