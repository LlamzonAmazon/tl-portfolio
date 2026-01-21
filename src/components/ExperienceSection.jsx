import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { ShinyText } from "./Animations/ShinyText";
import AnimatedContent from './Animations/AnimatedContent'
import experienceData from '../data/experience.json';

const experiences = experienceData.experiences;

export const ExperienceSection = () => {
  return (
    <section id="experience" className="py-24 px-4 relative">
      <AnimatedContent
        distance={300}
        direction="horizontal"
        reverse={true}
        duration={2.4}
        ease="power3.out"
        initialOpacity={0}
        animateOpacity
        scale={1.0}
        threshold={0.1}
        delay={0}
      >

        <div className="container mx-auto max-w-5xl">

          <div className="liquid-glass-surface mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {" "}
              My <span className="text-primary"> Experience </span>
            </h2>

            <ShinyText
              text="These are the work and volunteer experiences that shape my skills in the software field."
              disabled={false}
              speed={6}
              className='text-center text-sm md:text-base block mx-auto max-w-2xl'
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map((project) => (
              <div
                key={project.id}
                className="group liquid-glass-surface rounded-lg shadow-xs card-hover relative overflow-visible"
              >

                {project.logo && (
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full overflow-hidden border border-muted shadow-md bg-white">
                    <img src={project.logo} alt={`${project.organization} logo`} className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-1"> {project.title}</h3>

                  <p className="text-sm font-bold">
                    {project.organization}
                  </p>

                  <p className="text-neutral-400 text-sm mb-4 font-bold">
                    {project.time}
                  </p>

                  <p className="text-neutral-300 text-sm mb-4 whitespace-pre-line">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary-foreground text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </AnimatedContent>
    </section>
  );
};