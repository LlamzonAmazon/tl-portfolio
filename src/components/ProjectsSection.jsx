import { ArrowRight, Github } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "westernsalesclub.ca",
    description: 
      "The website for Western's first sales club, built to showcase the club's activities and mission. \n\n" +
      "I headed development of this website as the Project Manager of 5 full-stack student developers. \n\n" +
      "This website comes with a comprehensive GCP backend, the admin dashboard. Which allows the WSC executives to manage the dynamic content of the website such as the events, executives, and sponsors. \n\n",
    image: "/WSC.png",
    tags: ["React.js", "TailwindCSS",  "GCP", "MySQL", "Flask", "Firebase"],
    demoUrl: "https://westernsalesclub.ca",
    githubUrl: "#",
  },
  {
    id: 2,
    title: "RheumAI",
    description:
      "A doctor-patient interaction summarizing tool to assist Rheumatologists address their patients' needs. \n\n" +
      "I built this desktop application with a group for CS3307. \n\n" +
      "My role was implementing the settings menu features, building the user configurations storage system, and making the UX/UI Design. \n\n" +
      "My group and I were especially proud of the transcription accuracy of the application, which was made possible by using OpenAI's Whisper and Gemini APIs.",
    image: "/RheumAI.png",
    tags: ["C++", "Qt", "Google Speech", "OpenAI Whisper", "Google Gemini"],
    demoUrl: "https://github.com/CalThompson9/rheumAI",
    githubUrl: "#",
  },
  {
    id: 3,
    title: "More on the way!",
    description:
      "I am currently building projects with Western AI, Tech for Social Impact, and am completing my thesis. My hands are rather full as of the current moment. 😅 \n\n " + 
      "I do plan to take on more personal projects in the future.",
    image: "/GitHub.png",
    tags: ["🌍", "🚀", "🌖"],
    demoUrl: "---",
    githubUrl: "#",
  },
];

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {" "}
          Featured <span className="text-primary"> Projects </span>
        </h2>

        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Here are some of my recent projects. I am currently focusing on attaining cloud & security certifications, and plan to take on more projects in the future.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, key) => (
            <div
              key={key}
              className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover flex flex-col"
            >
              <div className="h-48 overflow-hidden">
                <a href={project.demoUrl} noreferrer="noreferrer" target="_blank">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                 </a>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-semibold mb-4"> {project.title}</h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-muted-foreground text-sm mb-4 text-neutral-400 whitespace-pre-line">
                  {project.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <a
                    className="cosmic-button w-fit flex items-center mx-auto gap-2"
                    target="_blank"
                    href={project.githubUrl}
                  >
                    <Github size={16} />
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
            href="https://github.com/LlamzonAmazon?tab=stars"
          >
            My projects on Github <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};