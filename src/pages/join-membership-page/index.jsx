import React from 'react';
import { Helmet } from 'react-helmet';
import PublicHeader from '../../components/ui/PublicHeader';
import MembershipBenefits from './components/MembershipBenefits';
import AlternativeActions from './components/AlternativeActions';

const JoinMembershipPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Join Membership - Basic Intelligence Community School</title>
        <meta name="description" content="Join Basic Intelligence Community School and gain access to comprehensive AI courses, live classes, and a vibrant learning community." />
        <meta name="keywords" content="AI education, membership, Basic Intelligence, courses, community, Nigeria" />
      </Helmet>
      <PublicHeader />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 lg:px-6 lg:py-12">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Join Our AI Learning Community
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take the next step in your AI journey. Join thousands of learners mastering practical AI skills for business and creativity.
            </p>
          </div>

          {/* Membership Benefits Section */}
          <MembershipBenefits />

          {/* Alternative Actions */}
          <AlternativeActions />

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-muted/30 border border-border rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  Secure Process
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your information is handled securely. We use manual verification to ensure all registrations are properly processed and your membership is activated promptly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 lg:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-foreground">Basic Intelligence</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Empowering minds through practical AI education and community learning
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date()?.getFullYear()} Basic Intelligence Community School. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JoinMembershipPage;