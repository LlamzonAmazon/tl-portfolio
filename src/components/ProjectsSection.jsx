import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { ShinyText } from "./Animations/ShinyText";
import AnimatedContent from './Animations/AnimatedContent'
import projectsData from '../data/projects.json';

const projects = projectsData.projects;

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 px-4 relative">
      <AnimatedContent
        distance={300}
        direction="horizontal"
        reverse={false}
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
              Featured <span className="text-primary"> Projects </span>
            </h2>

            <ShinyText
              text="I am also working to attain cybersecurity and cloud service certifications!"
              disabled={false}
              speed={6}
              className='text-center text-muted-foreground text-sm md:text-base block mx-auto max-w-2xl'
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, key) => (
              <div
                key={key}
                className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover flex flex-col"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold mb-4"> {project.title}</h3>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary-foreground text-neutral-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 text-neutral-300 whitespace-pre-line">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <a
                      className="cosmic-button w-fit flex items-center mx-auto"
                      target="_blank"
                      href={project.githubUrl}
                    >
                      <Github size={16} />
                    </a>

                    <a
                      className="cosmic-button w-fit flex items-center mx-auto"
                      target="_blank"
                      href={project.demoUrl}
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              className="cosmic-button w-fit flex items-center mx-auto gap-2"
              target="_blank"
              href="https://github.com/LlamzonAmazon"
            >
              My projects on Github <ArrowRight size={16} />
            </a>
          </div>
        </div>

      </AnimatedContent>
    </section>
  );
};