import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TeamSection = () => {
  const teamMembers = [
    {
      name: "Dr. Adebayo Ogundimu",
      role: "Founder & CEO",
      bio: "AI researcher with 10+ years experience in machine learning and business automation. Former consultant for Fortune 500 companies.",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
      expertise: ["Machine Learning", "Business Strategy", "AI Implementation"],
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Funmi Adebisi",
      role: "Head of Education",
      bio: "Educational technology specialist focused on creating engaging learning experiences for African professionals.",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
      expertise: ["Curriculum Design", "EdTech", "Learning Analytics"],
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Chidi Okwu",
      role: "Technical Director",
      bio: "Full-stack developer and AI engineer specializing in scalable educational platforms and automation systems.",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
      expertise: ["Software Development", "AI Systems", "Platform Architecture"],
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Kemi Adesanya",
      role: "Community Manager",
      bio: "Community building expert passionate about connecting professionals and fostering collaborative learning environments.",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
      expertise: ["Community Building", "Member Engagement", "Event Management"],
      social: {
        linkedin: "#",
        twitter: "#"
      }
    }
  ];

  const advisors = [
    {
      name: "Prof. Olumide Adeyemi",
      role: "AI Research Advisor",
      affiliation: "University of Lagos"
    },
    {
      name: "Mrs. Bola Tinubu",
      role: "Industry Relations",
      affiliation: "Tech Industry Veteran"
    },
    {
      name: "Mr. Emeka Okafor",
      role: "Business Strategy",
      affiliation: "Startup Ecosystem Leader"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our diverse team of educators, technologists, and industry experts is dedicated to your success in the AI revolution.
          </p>
        </div>

        {/* Core Team */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {teamMembers?.map((member, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto overflow-hidden rounded-full">
                  <Image
                    src={member?.image}
                    alt={member?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="CheckCircle" size={16} color="white" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-1">
                {member?.name}
              </h3>
              <p className="text-sm text-primary font-medium mb-3">
                {member?.role}
              </p>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {member?.bio}
              </p>

              {/* Expertise Tags */}
              <div className="flex flex-wrap justify-center gap-1 mb-4">
                {member?.expertise?.map((skill, skillIndex) => (
                  <span key={skillIndex} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex justify-center space-x-3">
                <button className="w-8 h-8 bg-muted hover:bg-primary hover:text-white rounded-full flex items-center justify-center transition-colors duration-200">
                  <Icon name="Linkedin" size={16} />
                </button>
                <button className="w-8 h-8 bg-muted hover:bg-primary hover:text-white rounded-full flex items-center justify-center transition-colors duration-200">
                  <Icon name="Twitter" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Advisors Section */}
        <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Our Advisory Board
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're guided by industry leaders and academic experts who help shape our vision and ensure we deliver world-class education.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {advisors?.map((advisor, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Award" size={24} className="text-secondary" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">
                  {advisor?.name}
                </h4>
                <p className="text-sm text-primary font-medium mb-2">
                  {advisor?.role}
                </p>
                <p className="text-xs text-muted-foreground">
                  {advisor?.affiliation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Join Team CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 lg:p-12">
          <Icon name="Users" size={48} className="text-primary/30 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Join Our Growing Team
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're always looking for passionate educators, technologists, and community builders who share our vision of democratizing AI education in Nigeria.
          </p>
          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200">
            <Icon name="Mail" size={16} />
            <span>careers@basicintelligence.com</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;