import { motion } from 'framer-motion';
import { useRef } from 'react';
import { FaInstagram } from 'react-icons/fa';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-lightest via-primary-light/20 to-primary/20 dark:from-primary-dark/30 dark:via-gray-900 dark:to-primary/30">
      <div className="h-full overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen w-full snap-start flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary-dark dark:from-primary-dark dark:via-primary dark:to-primary-light/80 py-24 sm:py-32 relative"
        >
          <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h4v4H0V0zm8 0h4v4H8V0zm8 0h4v4h-4V0zM4 4h4v4H4V4zm8 0h4v4h-4V4zm8 0h4v4h-4V4zM0 8h4v4H0V8zm8 0h4v4H8V8zm8 0h4v4h-4V8zM4 12h4v4H4v-4zm8 0h4v4h-4v-4zm8 0h4v4h-4v-4zM0 16h4v4H0v-4zm8 0h4v4H8v-4zm8 0h4v4h-4v-4z\' fill=\'white\' fill-opacity=\'0.1\'/%3E%3C/svg%3E')]" />
          <div className="relative text-center px-4">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              About FAMS
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false }}
              className="text-xl text-primary-lightest max-w-2xl mx-auto"
            >
              Discover the story behind your favorite beauty and skincare destination
            </motion.p>
          </div>
        </motion.section>

        {/* Collaboration Announcement Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          viewport={{ once: false }}
          className="min-h-screen w-full snap-start flex items-center justify-center bg-gradient-to-br from-purple-600 to-primary-dark dark:from-purple-800 dark:to-primary-dark/90 py-24 sm:py-32 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h4v4H0V0zm8 0h4v4H8V0zm8 0h4v4h-4V0zM4 4h4v4H4V4zm8 0h4v4h-4V4zm8 0h4v4h-4V4zM0 8h4v4H0V8zm8 0h4v4H8V8zm8 0h4v4h-4V8zM4 12h4v4H4v-4zm8 0h4v4h-4v-4zm8 0h4v4h-4v-4zM0 16h4v4H0v-4zm8 0h4v4H8v-4zm8 0h4v4h-4v-4z\' fill=\'white\' fill-opacity=\'0.1\'/%3E%3C/svg%3E')]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Exciting Partnership Announcement
              </h2>
              <div className="h-1 w-32 bg-green-400 mx-auto rounded-full mb-6"></div>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                We've joined forces with skincare experts to bring you the ultimate beauty experience
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false }}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-white"
              >
                <div className="flex items-center justify-center space-x-6 mb-6">
                  <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center relative overflow-hidden">
                    <span className="text-4xl font-black text-white">F</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-primary-dark opacity-50"></div>
                  </div>
                  <div className="text-5xl font-bold">+</div>
                  <div className="w-24 h-24 bg-green-400 rounded-full flex items-center justify-center relative overflow-hidden">
                    <span className="text-4xl font-black text-purple-900">G</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 opacity-50"></div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-center mb-4">FAMS × Groovy Clinics</h3>
                <p className="text-purple-100 mb-6">
                  We're thrilled to announce our collaboration with Groovy Clinics, a leading dermatology and skincare clinic. This partnership brings together our premium beauty products with expert dermatological knowledge and advanced skincare treatments.
                </p>
                
                <div className="bg-white/10 p-4 rounded-xl">
                  <h4 className="font-semibold text-purple-100 mb-2">What this means for you:</h4>
                  <ul className="space-y-2 text-purple-50">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Expert-recommended product selections</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Personalized skincare consultations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Special treatment packages</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Exclusive member discounts</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: false }}
                className="flex flex-col items-center"
              >
                <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
                  <img 
                    src="/images/groovy-logo.jpg" 
                    alt="Groovy Clinics Logo"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300/92c952?text=Groovy+Clinics";
                    }}
                    className="w-full h-full object-contain rounded-full p-6"
                  />
                </div>
                
                <a 
                  href="https://www.instagram.com/groovyclinics/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
                >
                  <FaInstagram className="text-2xl" />
                  <span className="font-medium">Follow @groovyclinics</span>
                </a>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Story Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          viewport={{ once: false }}
          className="min-h-screen w-full snap-start flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl py-24 sm:py-32 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Our <span className="bg-gradient-to-r from-primary to-primary-dark dark:from-primary-light dark:to-primary bg-clip-text text-transparent">Story</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  FAMS was born from a simple yet powerful idea: to make beauty and skincare accessible, effective, and joyful for everyone. Our name, which stands for "Formulating Amazing Moments in Skincare," reflects our commitment to helping you look and feel your best every day.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Since our inception, we've been dedicated to curating premium cosmetic and skincare products that combine scientific innovation with natural ingredients. Every product in our collection is carefully selected to ensure it meets our high standards for quality, effectiveness, and ethical sourcing.
                </p>
              </div>
              <motion.div
                initial={{ rotate: -5, opacity: 0 }}
                whileInView={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-2xl transform -rotate-3"></div>
                <img
                  src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908"
                  alt="Beauty Products"
                  className="relative rounded-2xl shadow-xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          viewport={{ once: false }}
          className="min-h-screen w-full snap-start flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl py-24 sm:py-32"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl"
            >
              {[
                { number: "500+", text: "Premium Skincare Products" },
                { number: "24/7", text: "Expert Consultation" },
                { number: "100%", text: "Cruelty-Free Guarantee" },
                { number: "98%", text: "Customer Satisfaction" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: false }}
                  className="text-center space-y-2"
                >
                  <div className="text-4xl font-bold text-primary dark:text-primary-light">{stat.number}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.text}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          viewport={{ once: false }}
          className="min-h-screen w-full snap-start flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl py-24 sm:py-32"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <div className="order-2 md:order-1 relative">
                <motion.div
                  initial={{ rotate: 5, opacity: 0 }}
                  whileInView={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: false }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-light/20 to-primary/20 rounded-2xl transform rotate-3"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <img
                      src="https://www.shutterstock.com/shutterstock/videos/1106495333/thumb/1.jpg?ip=x480"
                      alt="Skincare Products"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Core Values
                      </h3>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                        <li>• Science-backed Formulations</li>
                        <li>• Dermatologist Approved</li>
                        <li>• Sustainable & Ethical Practices</li>
                        <li>• Inclusive Beauty for All</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Our <span className="bg-gradient-to-r from-primary to-primary-dark dark:from-primary-light dark:to-primary bg-clip-text text-transparent">Mission</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Our mission is to empower individuals on their skincare journey by providing expert knowledge, personalized consultations, and premium products that deliver real results. We believe that healthy skin is the foundation of confidence.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  We're committed to transparency in our ingredients, sustainability in our practices, and inclusivity in our approach. We strive to create a world where everyone has access to effective skincare solutions tailored to their unique needs.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* FAMS Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          viewport={{ once: false }}
          className="min-h-screen w-full snap-start flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl py-24 sm:py-32"
        >
          <div className="max-w-3xl w-full mx-auto px-4">
            {[
              { letter: 'F', text: "Farah Mohammed" },
              { letter: 'A', text: "Alia Hesham" },
              { letter: 'M', text: "Mariem & Malak Ahmed" },
              { letter: 'S', text: "Sief Tamer" }
            ].map((item, index) => (
              <motion.div
                key={item.letter}
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: false }}
                className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-xl mb-4 md:mb-8"
              >
                <div className="flex items-center space-x-4">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    viewport={{ once: false }}
                    className="text-5xl md:text-8xl font-black bg-gradient-to-r from-primary to-primary-dark dark:from-primary-light dark:to-primary bg-clip-text text-transparent w-16 md:w-32 text-center flex-shrink-0"
                  >
                    {item.letter}
                  </motion.div>
                  
                  <div className="flex-1 flex items-center min-w-0">
                    <div className="hidden md:block w-24 lg:w-32">
                      <svg width="100%" height="40" className="overflow-visible">
                        <motion.path
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          viewport={{ once: false }}
                          d={`M 0,20 Q 40,20 50,${index % 2 === 0 ? '10' : '30'} T 100,20`}
                          fill="none"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          className="stroke-primary dark:stroke-primary-light"
                        />
                        <motion.circle
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                          viewport={{ once: false }}
                          cx="100"
                          cy="20"
                          r="6"
                          className="fill-none stroke-primary dark:stroke-primary-light"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />
                      </svg>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        viewport={{ once: false }}
                        className="text-xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark dark:from-primary-light dark:to-primary bg-clip-text text-transparent truncate block"
                      >
                        {item.text}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
} 