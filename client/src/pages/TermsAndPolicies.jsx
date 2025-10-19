import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const TermsAndPolicies = () => {
  const [activeTab, setActiveTab] = useState('terms');
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const location = useLocation();

  useEffect(() => {
    // Scroll to top of page when component mounts
    window.scrollTo(0, 0);
    
    // Check for hash in URL and set active tab accordingly
    if (location.hash) {
      const hash = location.hash.replace('#', '');
      if (['terms', 'returns', 'shipping', 'privacy'].includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, [location]);

  const toggleFaq = (id) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const tabs = [
    { id: 'terms', label: 'Terms of Service' },
    { id: 'returns', label: 'Return Policy' },
    { id: 'shipping', label: 'Shipping Policy' },
    { id: 'privacy', label: 'Privacy Policy' }
  ];

  const returnFaqs = [
    {
      id: 'return-1',
      question: 'How long do I have to return a product?',
      answer: 'You have 14 days from the date of delivery to initiate a return. Products must be in their original condition, unused, and with all original packaging and tags.'
    },
    {
      id: 'return-2',
      question: "Can I return a product if I've opened it?",
      answer: 'For hygiene and safety reasons, we cannot accept returns of beauty products that have been opened, used, or had their seals broken. Products must be in their original condition with all seals intact.'
    },
    {
      id: 'return-3',
      question: 'How do I start a return?',
      answer: 'To initiate a return, please contact our customer support team through the chat feature available on the website. Our team will guide you through the return process and provide you with further instructions.'
    },
    {
      id: 'return-4',
      question: 'How will I receive my refund?',
      answer: 'Refunds will be issued to the original payment method used for the purchase. Refund processing typically takes 7-10 business days after we receive the returned item.'
    }
  ];

  const shippingFaqs = [
    {
      id: 'shipping-1',
      question: 'How long will it take to receive my order?',
      answer: '3-8 working days (excluding Friday, Saturday, or any official holidays). Delivery times may vary based on your location and current order volume.'
    },
    {
      id: 'shipping-2',
      question: 'Do you offer international shipping?',
      answer: 'Currently, we only ship within Egypt. We hope to expand our shipping options to include international destinations in the future.'
    },
    {
      id: 'shipping-3',
      question: 'How can I track my order?',
      answer: 'Once your order has been shipped, you will receive a confirmation email with tracking information. You can also track your order by logging into your account and viewing your order history.'
    },
    {
      id: 'shipping-4',
      question: 'What are the shipping fees?',
      answer: 'Shipping fees vary based on your location in Egypt. Fees range from 55 EGP for Delta region to 90 EGP for Upper Egypt. Our delivery team will contact you before shipping your order.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Terms & Policies
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content Sections */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8">
          {/* Terms of Service */}
          {activeTab === 'terms' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h2>
              
              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h3>
                  <p className="mb-3">
                    Welcome to FAMS Store! These Terms of Service ("Terms") govern your use of our website, mobile applications, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy.
                  </p>
                  <p>
                    Please read these Terms carefully before using our Services. If you do not agree with any part of these Terms, you may not use our Services.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Account Registration</h3>
                  <p className="mb-3">
                    To access certain features of our Services, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                  </p>
                  <p className="mb-3">
                    You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
                  </p>
                  <p>
                    We reserve the right to suspend or terminate your account at our discretion, without notice, if we believe you have violated these Terms or for any other reason.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Ordering and Payments</h3>
                  <p className="mb-3">
                    When placing an order through our Services, you agree to provide accurate and complete information about yourself and your payment method. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in product descriptions or pricing, or suspicion of fraudulent activity.
                  </p>
                  <p className="mb-3">
                    All prices are displayed in Egyptian Pounds (EGP) and are inclusive of applicable taxes. Shipping fees will be calculated and displayed at checkout.
                  </p>
                  <p>
                    By providing a payment method, you represent and warrant that you are authorized to use the designated payment method and that the payment information you provide is accurate and complete.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Intellectual Property</h3>
                  <p className="mb-3">
                    All content included in or made available through our Services, including but not limited to text, graphics, logos, images, videos, and software, is the property of FAMS Store or its licensors and is protected by intellectual property laws.
                  </p>
                  <p>
                    You may not use, reproduce, distribute, modify, or create derivative works from any content from our Services without our express prior written consent.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Limitation of Liability</h3>
                  <p className="mb-3">
                    To the maximum extent permitted by law, FAMS Store and its affiliates, officers, employees, agents, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our Services.
                  </p>
                  <p>
                    Our total liability to you for any claims arising from or related to these Terms or our Services shall not exceed the amount you paid to us for the applicable products or services.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Changes to Terms</h3>
                  <p className="mb-3">
                    We may modify these Terms at any time by posting the revised terms on our website. Your continued use of our Services after any such changes constitutes your acceptance of the new Terms.
                  </p>
                  <p>
                    It is your responsibility to review these Terms periodically to stay informed of any updates.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Governing Law</h3>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of Egypt, without regard to its conflict of law provisions. Any disputes arising from or relating to these Terms or our Services shall be subject to the exclusive jurisdiction of the courts in Cairo, Egypt.
                  </p>
                </section>
              </div>
            </motion.div>
          )}
          
          {/* Return Policy */}
          {activeTab === 'returns' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Return Policy</h2>
              
              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Return Eligibility</h3>
                  <p className="mb-3">
                    We want you to be completely satisfied with your purchase. If you're not satisfied with your order, you may be eligible to return it under the following conditions:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    <li>Returns must be initiated within 14 days of the delivery date.</li>
                    <li>Products must be in their original condition, unused, and with all original packaging and tags.</li>
                    <li>For hygiene and safety reasons, we cannot accept returns of beauty products that have been opened, used, or had their seals broken.</li>
                    <li>Items marked as "Final Sale" or "Non-Returnable" cannot be returned.</li>
                    <li>Gift cards are non-refundable.</li>
                  </ul>
                  <p>
                    Please note that we reserve the right to refuse returns that do not meet these requirements.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Return Process</h3>
                  <p className="mb-3">
                    To initiate a return, please follow these steps:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 mb-3">
                    <li>Log in to your account on our website.</li>
                    <li>Use the customer support chat feature available on the bottom right of every page.</li>
                    <li>Explain which item you wish to return and the reason for the return.</li>
                    <li>Our customer support team will guide you through the next steps and provide return instructions.</li>
                    <li>Pack the item securely in its original packaging.</li>
                    <li>Ship the package to the address provided in the return instructions.</li>
                  </ol>
                  <p>
                    Our customer support team is available to assist you with any questions or concerns regarding your return.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Refunds</h3>
                  <p className="mb-3">
                    Once we receive and inspect your return, we will process your refund. Refunds will be issued to the original payment method used for the purchase.
                  </p>
                  <p className="mb-3">
                    Refund processing typically takes 7-10 business days after we receive the returned item. The time it takes for the refund to appear in your account depends on your payment provider's processing time.
                  </p>
                  <p>
                    Please note that shipping fees are non-refundable unless the return is due to our error (e.g., incorrect or defective item).
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Damaged or Defective Items</h3>
                  <p className="mb-3">
                    If you receive a damaged or defective item, please contact our customer support team within 48 hours of delivery. Please provide photos of the damaged item and packaging to help us resolve the issue promptly.
                  </p>
                  <p>
                    We may offer a replacement, refund, or store credit, depending on the situation and product availability.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {returnFaqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full px-4 py-3 text-left flex justify-between items-center bg-gray-50 dark:bg-gray-700"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                          {expandedFaqs[faq.id] ? (
                            <FaChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <FaChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                        {expandedFaqs[faq.id] && (
                          <div className="px-4 py-3 bg-white dark:bg-gray-800">
                            <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          )}
          
          {/* Shipping Policy */}
          {activeTab === 'shipping' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Shipping Policy</h2>
              
              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Shipping Information</h3>
                  <p className="mb-3">
                    FAMS Store is committed to providing reliable and efficient shipping services for all orders. We currently offer shipping within Egypt only.
                  </p>
                  <p>
                    All orders are processed and shipped from our warehouse in Cairo, Egypt.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Shipping Methods & Delivery Times</h3>
                  <p className="mb-3">
                    We offer standard shipping throughout Egypt with different rates based on your region:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Region</th>
                          <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Estimated Delivery Time</th>
                          <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="px-4 py-2">Delta</td>
                          <td className="px-4 py-2">3-8 working days</td>
                          <td className="px-4 py-2">55 EGP</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Cairo</td>
                          <td className="px-4 py-2">3-8 working days</td>
                          <td className="px-4 py-2">70 EGP</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Canal</td>
                          <td className="px-4 py-2">3-8 working days</td>
                          <td className="px-4 py-2">70 EGP</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Alexandria</td>
                          <td className="px-4 py-2">3-8 working days</td>
                          <td className="px-4 py-2">80 EGP</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">Upper Egypt</td>
                          <td className="px-4 py-2">3-8 working days</td>
                          <td className="px-4 py-2">90 EGP</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3">
                    <strong>Note:</strong> Delivery times exclude Friday, Saturday, and official holidays. Our delivery team will contact you before shipping your order.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Order Processing</h3>
                  <p className="mb-3">
                    Orders are typically processed within 1-2 business days after payment confirmation. You will receive a confirmation email when your order has been shipped, along with tracking information.
                  </p>
                  <p>
                    Business days are Monday through Friday, excluding holidays. Orders placed on weekends or holidays will be processed on the next business day.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Order Tracking</h3>
                  <p className="mb-3">
                    Once your order has been shipped, you will receive a confirmation email with tracking information. You can also track your order by logging into your account and viewing your order history.
                  </p>
                  <p>
                    If you have any questions about your shipment, please contact our customer support team with your order number.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Shipping Restrictions</h3>
                  <p>
                    Certain products may have shipping restrictions due to their nature or ingredients. If a product cannot be shipped to your location, this will be indicated on the product page or during checkout.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {shippingFaqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full px-4 py-3 text-left flex justify-between items-center bg-gray-50 dark:bg-gray-700"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                          {expandedFaqs[faq.id] ? (
                            <FaChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <FaChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                        {expandedFaqs[faq.id] && (
                          <div className="px-4 py-3 bg-white dark:bg-gray-800">
                            <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          )}
          
          {/* Privacy Policy */}
          {activeTab === 'privacy' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h2>
              
              <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Introduction</h3>
                  <p className="mb-3">
                    At FAMS Store, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                  </p>
                  <p>
                    By accessing or using our services, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Information We Collect</h3>
                  <p className="mb-3">
                    We collect several types of information from and about users of our services, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    <li>
                      <strong>Personal Information:</strong> Name, email address, postal address, phone number, and other personal details you provide when creating an account, placing an order, or contacting us.
                    </li>
                    <li>
                      <strong>Payment Information:</strong> Credit card numbers, billing addresses, and other payment details necessary to process your transactions. We do not store full credit card information on our servers.
                    </li>
                    <li>
                      <strong>Account Information:</strong> Login credentials, account preferences, and order history.
                    </li>
                    <li>
                      <strong>Device and Usage Information:</strong> Information about your device, browser, IP address, and how you interact with our website.
                    </li>
                    <li>
                      <strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to collect information about your browsing activities and preferences.
                    </li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How We Use Your Information</h3>
                  <p className="mb-3">
                    We use the information we collect for various purposes, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    <li>Processing and fulfilling your orders</li>
                    <li>Creating and managing your account</li>
                    <li>Providing customer support</li>
                    <li>Sending transactional emails and order updates</li>
                    <li>Sending marketing communications (with your consent)</li>
                    <li>Improving our website and services</li>
                    <li>Analyzing usage patterns and trends</li>
                    <li>Detecting and preventing fraud</li>
                    <li>Complying with legal obligations</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Information Sharing and Disclosure</h3>
                  <p className="mb-3">
                    We may share your information with:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    <li>
                      <strong>Service Providers:</strong> Third-party vendors who provide services on our behalf, such as payment processing, shipping, and marketing.
                    </li>
                    <li>
                      <strong>Business Partners:</strong> Trusted partners who help us operate our business and deliver services to you.
                    </li>
                    <li>
                      <strong>Legal Authorities:</strong> When required by law, in response to legal process, or to protect our rights.
                    </li>
                  </ul>
                  <p>
                    We do not sell or rent your personal information to third parties for their marketing purposes without your explicit consent.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Data Security</h3>
                  <p className="mb-3">
                    We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.
                  </p>
                  <p>
                    However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Your Rights and Choices</h3>
                  <p className="mb-3">
                    Depending on your location, you may have certain rights regarding your personal information, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    <li>Accessing and updating your personal information</li>
                    <li>Requesting deletion of your personal information</li>
                    <li>Objecting to or restricting certain processing activities</li>
                    <li>Withdrawing consent for marketing communications</li>
                    <li>Requesting a copy of your personal information</li>
                  </ul>
                  <p>
                    To exercise these rights, please contact us using the information provided at the end of this policy.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Children's Privacy</h3>
                  <p>
                    Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us, and we will take steps to delete such information.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Changes to This Privacy Policy</h3>
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will post the updated Privacy Policy on our website with a revised "Last Updated" date. We encourage you to review this Privacy Policy periodically.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Contact Us</h3>
                  <p>
                    If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
                  </p>
                  <div className="mt-3">
                    <p><strong>Email:</strong> privacy@famsstore.com</p>
                    <p><strong>Address:</strong> FAMS Store, Cairo, Egypt</p>
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermsAndPolicies; 