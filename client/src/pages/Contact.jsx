import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDroplet, FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa';
import AquaBeaconLogo from '../components/AquaBeaconLogo';
import toast from 'react-hot-toast';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiry_type: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    try {
      // In production, this would call: await api.post('/contact', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiry_type: 'general'
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  // Map a semantic color name to concrete Tailwind classes to avoid dynamic class interpolation
  const colorClassMap = {
    blue: {
      border: 'border-t-4 border-blue-500',
      bg: 'bg-blue-100',
      text: 'text-blue-600'
    },
    green: {
      border: 'border-t-4 border-green-500',
      bg: 'bg-green-100',
      text: 'text-green-600'
    },
    purple: {
      border: 'border-t-4 border-purple-500',
      bg: 'bg-purple-100',
      text: 'text-purple-600'
    },
    red: {
      border: 'border-t-4 border-red-500',
      bg: 'bg-red-100',
      text: 'text-red-600'
    }
  };

  const contactMethods = [
    {
      icon: <FiMail className="w-6 h-6" aria-hidden />,
      title: 'Email Us',
      description: 'Our team will respond within 24 hours',
      contact: 'support@aquabeacon.co.ke',
      link: 'mailto:support@aquabeacon.co.ke',
      color: 'blue'
    },
    {
      icon: <FaWhatsapp className="w-6 h-6" aria-hidden />,
      title: 'WhatsApp',
      description: 'Quick response, business hours',
      contact: '+254 707806523',
      link: 'https://wa.me/254707806523?text=Hi,%20I%20need%20help%20with%20AquaBeacon',
      color: 'green'
    },
    {
      icon: <FiPhone className="w-6 h-6" aria-hidden />,
      title: 'Call Us',
      description: 'Mon-Fri, 8am-6pm EAT',
      contact: '+254 707806523',
      link: 'tel:+254707806523',
      color: 'purple'
    },
    {
      icon: <FiMapPin className="w-6 h-6" aria-hidden />,
      title: 'Visit Office',
      description: 'By appointment only',
      contact: 'Nairobi, Kenya',
      link: 'https://maps.google.com',
      color: 'red'
    }
  ];

  const departments = [
    { 
      name: 'Sales Inquiries',
      email: 'sales@aquabeacon.co.ke',
      description: 'Pricing, demos, and enterprise plans'
    },
    { 
      name: 'Technical Support',
      email: 'support@aquabeacon.co.ke',
      description: 'Help with platform features and issues'
    },
    { 
      name: 'Compliance & Standards',
      email: 'compliance@aquabeacon.co.ke',
      description: 'KEBS standards and certification questions'
    },
    { 
      name: 'Partnerships',
      email: 'partners@aquabeacon.co.ke',
      description: 'Collaboration opportunities'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <AquaBeaconLogo size="sm" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Back to Home
              </Link>
              <Link
                to="/signin"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions? We're here to help! Reach out to us through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => {
              const color = colorClassMap[method.color] || colorClassMap.blue;
              const isExternal = method.link.startsWith('http');
              return (
                <a
                  key={index}
                  href={method.link}
                  target={isExternal ? '_blank' : '_self'}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 ${color.border} hover:-translate-y-1 group`}
                >
                  <div className={`${color.bg} ${color.text} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {method.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                  <p className="text-primary-600 font-medium text-sm">{method.contact}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-green-700 mb-6">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+254 707806523"
                    />
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label htmlFor="inquiry_type" className="block text-sm font-medium text-gray-700 mb-1">
                      Inquiry Type *
                    </label>
                    <select
                      id="inquiry_type"
                      name="inquiry_type"
                      required
                      value={formData.inquiry_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales & Pricing</option>
                      <option value="support">Technical Support</option>
                      <option value="compliance">Compliance & KEBS</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* Business Hours */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <FiClock className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM EAT</p>
                      <p><strong>Saturday:</strong> 9:00 AM - 2:00 PM EAT</p>
                      <p><strong>Sunday:</strong> Closed</p>
                      <p className="text-blue-600 mt-2">
                        <FaWhatsapp className="inline mr-1" />
                        WhatsApp available 24/7 for urgent issues
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Departments */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Departments</h3>
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-gray-900 mb-1">{dept.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                      <a href={`mailto:${dept.email}`} className="text-primary-600 hover:underline text-sm font-medium">
                        {dept.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a
                    key="twitter"
                    href="https://twitter.com/aquabeacon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaTwitter className="w-6 h-6 text-blue-400" />
                  </a>
                  <a
                    key="facebook"
                    href="https://facebook.com/aquabeacon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaFacebook className="w-6 h-6 text-blue-600" />
                  </a>
                  <a
                    key="linkedin"
                    href="https://linkedin.com/company/aquabeacon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaLinkedin className="w-6 h-6 text-blue-700" />
                  </a>
                  <a
                    key="instagram"
                    href="https://instagram.com/aquabeacon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaInstagram className="w-6 h-6 text-pink-600" />
                  </a>
                  
                  <a
                    key="whatsapp-social"
                    href="https://wa.me/254707806523"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaWhatsapp className="w-6 h-6 text-green-500" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  <Link key="help-center" to="/help-center" className="block text-primary-600 hover:underline">
                    Help Center & FAQs
                  </Link>
                  <Link key="knowledge-hub" to="/knowledge-hub" className="block text-primary-600 hover:underline">
                    Knowledge Hub
                  </Link>
                  <Link key="pricing" to="/pricing" className="block text-primary-600 hover:underline">
                    View Pricing
                  </Link>
                  <Link key="report-issue" to="/complaints/submit" className="block text-primary-600 hover:underline">
                    Report Water Issue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prefer to Chat Directly?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Our team is available on WhatsApp for instant responses
          </p>
          
          <a
            href="https://wa.me/254707806523?text=Hi,%20I%20need%20help%20with%20AquaBeacon"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 font-semibold text-lg shadow-lg transition-all hover:scale-105"
            aria-label="Chat with AquaBeacon on WhatsApp"
          >
            <FaWhatsapp className="mr-2 w-6 h-6" aria-hidden />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </section>

      {/* Footer - Simple */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; 2025 AquaBeacon. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/pricing" className="hover:text-white">Pricing</Link>
            <Link to="/help-center" className="hover:text-white">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;