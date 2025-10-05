import { ArrowDown, University } from "lucide-react";
import GradientText from "./Animations/GradientText";
import AnimatedContent from "./Animations/AnimatedContent";

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-4"
    >
      <div className="container max-w-5xl mx-auto text-center z-10">
        <div className="space-y-6">

          <AnimatedContent
            distance={50}
            direction="vertical"
            reverse={true}
            duration={1.8}
            ease="power3.out"
            initialOpacity={0.1}
            animateOpacity
            scale={1.5}
            threshold={0.2}
            delay={0.1}
          >
            <h1 className="text-4xl sm:text-6xl md:text-9xl font-bold tracking-tight">
              <GradientText
                colors={["#b764ffff", "#5b00b5ff", "#c40031ff", "#7c00daff", "#2000beff"]}
                animationSpeed={5}
                showBorder={false}
                className="custom-class"
              >
                Thomas Llamzon
              </GradientText>
            </h1>
          </AnimatedContent>

          <AnimatedContent
            distance={50}
            direction="vertical"
            reverse={false}
            duration={2.8}
            ease="power3.out"
            initialOpacity={0.1}
            animateOpacity
            scale={0.7}
            threshold={0.2}
            delay={0.1}
          >
            <div>
              <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Fourth-year computer science student at
                <span className="text-primary text-glow"> Western University</span>,
                growing towards a software engineering career and interested in cybersecurity and cloud applications. 
              </p>
            </div>
          </AnimatedContent>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-sm text-muted-foreground mb-2"> Scroll </span>
        <ArrowDown className="h-5 w-5 text-primary" />
      </div>
    </section>
  );
};