import { Linkedin } from "lucide-react";
import AnimatedContent from './Animations/AnimatedContent'

export const ContactSection = () => {

  return (
    <section id="contact" className="py-24 px-4 relative bg-secondary/30">
    <AnimatedContent
      distance={150}
      direction="vertical"
      reverse={true}
      duration={2.0}
      ease="power3.out"
      initialOpacity={0}
      animateOpacity
      scale={1.2}
      threshold={0.1}
      delay={0}
    >

      <div className="container mx-auto max-w-5xl">

        <div className="liquid-glass-surface mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            <span className="text-primary"> Connect</span> with me
          </h2>
        </div>

        <div className="flex justify-center">
          <a
            href="https://www.linkedin.com/in/thomasllamzon/"
            target="_blank"
            className="text-foreground/80 hover:text-primary transition-colors duration-300 group"
          >
            <Linkedin
              className="w-10 h-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
            />
          </a>

        </div>
      </div>

    </AnimatedContent>
    </section>
  );
};