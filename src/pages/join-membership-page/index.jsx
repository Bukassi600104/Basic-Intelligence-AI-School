import React from 'react';
import { Helmet } from 'react-helmet';
import PublicHeader from '../../components/ui/PublicHeader';
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
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-bold text-blue-600 mb-4">
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
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Secure & Verified Process
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your information is handled securely with <span className="font-bold text-emerald-600">bank-level encryption</span>. We use manual verification to ensure all registrations are properly processed and your membership is activated promptly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Footer - Enhanced */}
      <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 border-t border-white/10 mt-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 py-8 lg:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Basic Intelligence</span>
            </div>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Empowering minds through practical AI education and community learning
            </p>
            <p className="text-xs text-gray-400">
              © {new Date()?.getFullYear()} <span className="font-bold text-white">Basic Intelligence Community School</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JoinMembershipPage;