import { Briefcase, Code, User } from "lucide-react";
import AnimatedContent from './Animations/AnimatedContent'

export const AboutSection = () => {
  return (
    
    <section id="about" className="py-24 px-4 relative">
    <AnimatedContent
      distance={500}
      direction="horizontal"
      reverse={false}
      duration={1.5}
      ease="power3.out"
      initialOpacity={0.1}
      animateOpacity
      scale={1.0}
      threshold={0.08}
      delay={0}
    >

      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          About <span className="text-primary"> Me</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">

            <p className="text-muted-foreground text-gray-300">
              I live a very balanced and full life. 
              I am a student, software developer, project manager, mentor, athlete, and friend. 
            </p>
            <p className="text-muted-foreground text-gray-300">
              In my professional endeavours, I am pursuing a career in software engineering, with a focus in 
              cybersecurity and cloud applications, and machine learning.
            </p>
            <p className="text-muted-foreground text-gray-300">
              I hope to leverage my social & active nature to achieve a well-rounded software-centric position where I can 
              make a positive impact in the software field.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <a href="#contact" className="cosmic-button">
                {" "}
                Connect with Me
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Software Development</h4>
                  <p className="text-muted-foreground text-gray-300">
                    Solving unique problems with creative code solutions.
                  </p>
                </div>
              </div>
            </div>
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-lg">Security and Cloud Computing</h4>
                  <p className="text-muted-foreground text-gray-300">
                    Passionate about cybersecurity and cloud applications, with a focus on AI.
                  </p>
                </div>
              </div>
            </div>
            <div className="gradient-border p-6 card-hover">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>

                <div className="text-left">
                  <h4 className="font-semibold text-lg">Project Management</h4>
                  <p className="text-muted-foreground text-gray-300">
                    Leading teams to develop and deliver quality software products.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </AnimatedContent>
    </section>
  );
};