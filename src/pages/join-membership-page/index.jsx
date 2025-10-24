import React from 'react';
import { Helmet } from 'react-helmet';
import PublicHeader from '../../components/ui/PublicHeader';
import Footer from '../../components/ui/Footer';
import MembershipBenefits from './components/MembershipBenefits';
import AlternativeActions from './components/AlternativeActions';

const JoinMembershipPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Helmet>
        <title>Join Membership - Basic Intelligence Community School</title>
        <meta name="description" content="Join Basic Intelligence Community School and gain access to comprehensive AI courses, live classes, and a vibrant learning community." />
        <meta name="keywords" content="AI education, membership, Basic Intelligence, courses, community, Nigeria" />
      </Helmet>
      <PublicHeader />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 lg:px-6 lg:py-12">
          {/* Page Header - Enhanced */}
          <div className="text-center mb-12 animate-fadeIn">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-100 rounded-full text-sm font-bold text-orange-600 mb-4">
              Join Our Community
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Transform Your Career with AI
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Take the next step in your AI journey. Join <span className="font-bold text-gray-900">thousands of learners</span> mastering practical AI skills for business and creativity.
            </p>
          </div>

          {/* Membership Benefits Section */}
          <MembershipBenefits />

          {/* Alternative Actions */}
          <AlternativeActions />

          {/* Security Notice - Enhanced */}
          <div className="mt-8 relative overflow-hidden rounded-2xl bg-white border-2 border-emerald-200 p-6 hover:border-emerald-400 hover:shadow-xl transition-all animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative flex items-start space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Secure & Verified Process
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your information is handled securely with <span className="font-bold text-orange-600">bank-level encryption</span>. We use manual verification to ensure all registrations are properly processed and your membership is activated promptly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JoinMembershipPage;
