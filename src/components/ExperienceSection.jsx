import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { ShinyText } from "./Animations/ShinyText";
import AnimatedContent from './Animations/AnimatedContent'

const projects = [
  {
    id: 1,
    title: "Vice President, Projects",
    organization: "Western AI",
    time: "June 2025 - Present",
    description:
      "I oversee the development of four machine-learning projects. " +
      "I manage all project timelines and conduct structured weekly meetings with the PM's to discuss progress, resolve logistical challenges, and guide the direction of their projects. " +
      "The projects include:\n\n• Driver-Drowsiness Detector (OpenCV, YOLOv8n, PyTorch)\n\n• Toronto Condominium-Affordability Predictor (scikit-learn, LightGBM)\n\n• Code-Similarity Detector (CodeBERT, scikit-learn)\n\n• Video Virality Analyzer (CLIP, OpenL3, UMAP, LightGBM) \n\n",

    tags: ["AI/ML Project Management", "Logistical & Documentation Support", "Technical Feasibility Analysis"],
    logo: "/WAI.jpeg",
  },
  {
    id: 2,
    title: "Project Manager",
    organization: "Tech for Social Impact @ Western",
    time: "January 2025 - Present",
    description:
      "In this role, I lead student-developer teams to create software solutions for local non-profit organizations. \n\n" +
      "The first project I led was making the website for Western's sales club. The site increases their online engagement and establishes them as a key player in the Western club community.\n\n" +
      "My current project is making an interactive data insights dashboard for PlanCatalyst's redesigned website. " +
      "This dashboard will showcase PlanCatalyst’s analytical capabilities and support stakeholders by providing localized, policy-relevant data. \n\n",
    tags: ["Project Management", "Software Development", "Client Relations", "Documentation"],
    logo: "/TSI.jpeg",
  },
  {
    id: 3,
    title: "Security Operations Intern",
    organization: "CYBERWELL Solutions",
    time: "April 2025 - September 2025",
    description:
      "I worked under the various parts of the blue-team security operations, including incident response, threat intelligence, and third-party risk management. " +
      "My role involved:\n\n Performing SOC incident response measures using Exabeam TDIR & Cortex XDR to prevent security breaches in client environments.\n\n" +
      "Updating alert logic with OSINT in Microsoft Defender with KQL to pre-emptively prepare client environments for potential attacks.\n\n" +
      "Conducting Third-party risk management (TPRM) assessments to minimize legal and logistical risk associated with company vendors.\n\n",
    tags: ["Cortex", "Exabeam", "Miccrosoft Entra ID", "MITRE ATT&CK"],
    logo: "/CYBERWELL.jpeg",
  },
  {
    id: 4,
    title: "Coding Tutor",
    organization: "Code Ninjas",
    time: "June 2024 - August 2024",
    description:
    "At Code Ninjas, I taught kids aged 7-14 how to code using Microsoft MakeCode Arcade, Scratch 3.0, Unity, and fun online games. \n\n" +
    "I also developed the curriculum for Code Ninjas' first \"Future Minds\" summer camp that introduces children to how AI models learn using fun online resources such as ML 4 Kids powered by IBM Watson, Scratch 3.0, and more! \n\n" +
    "Outside of the 7 weeks of summer camps I led, I also helped children as a coding tutor in the Code Ninjas classes.\n\n",
    tags: ["Microsoft MakeCode", "Scratch 3.0", "Unity", "ML 4 Kids with IBM Watson", "Curriculum Development", "Teaching"],
    logo: "/CN.png",
},
{
    id: 5,
    title: "IT Intern",
    organization: "WELL Health Technologies",
    time: "May 2023 - September 2023",
    description:
    "At WELL, I worked under different teams within the IT team to learn and contribute to the company's growing digital infrastructure.\n\n" +
    "I helped develop a Bash agent gathering WELL clinic device analytics and logs into Azure to centralize logs for device security and analysis.\n\n" +
    "I also worked with the security compliance team to ensure the protection of sensitive patient information under industry standards & frameworks such as HIPAA and ISO/SEC 27001.\n\n",
    tags: ["Bash", "Microsoft Azure"],
    logo: "/WELL.png",
},
];

export const ExperienceSection = () => {
  return (
    <section id="experience" className="py-24 px-4 relative">
    <AnimatedContent
      distance={300}
      direction="horizontal"
      reverse={true}
      duration={2.4}
      ease="power3.out"
      initialOpacity={0.1}
      animateOpacity
      scale={1.0}
      threshold={0.1}
      delay={0}
    >

      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {" "}
          My <span className="text-primary"> Experience </span>
        </h2>

        <ShinyText
          text="These are the work and volunteer experiences that shape my skills in the software field."
          disabled={false}
          speed={6}
          className='text-center mb-12 text-sm md:text-base block mx-auto max-w-2xl'
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-card rounded-lg shadow-xs card-hover relative overflow-visible"
            >

                {project.logo && (
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full overflow-hidden border border-muted shadow-md bg-white">
                    <img src={project.logo} alt={`${project.organization} logo`} className="w-full h-full object-contain" />
                </div>
                )}

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1"> {project.title}</h3>
                
                <p className="text-sm font-bold">
                  {project.organization}
                </p>

                <p className="text-neutral-400 text-sm mb-4 font-bold">
                  {project.time}
                </p>

                <p className="text-neutral-400 text-sm mb-4 whitespace-pre-line">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary-foreground"
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