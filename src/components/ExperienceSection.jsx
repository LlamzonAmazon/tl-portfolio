import { ArrowRight, ExternalLink, Github } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "Vice President, Projects",
    organization: "Western AI",
    time: "June 2025 - Present",
    description:
      "As VP Projects of Western AI, my role is overseeing the development of eight ML-focused projects. These projects are to be presented at the Canadian Undergraduate Conference on AI (CUCAI) in Toronto in March 2026 on behalf of Western AI. \n\n" +
      "I conduct structured weekly meetings with the PM's to discuss progress, address challenges, and guide the direction of their projects. \n\n",

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
      "My first project with TSI was the website for Western Sales Club, who I personally pitched TSI's services to due to another client dropping out of the TSI program. \n\n" +
      "I continue to work with TSI as a Project Manager, and I continue making impactful solutions—not just for clubs at Western, but for real-world non-profit organizations as well. \n\n",
    tags: ["Project Management", "Software Development", "Client Relations", "Documentation"],
    logo: "/TSI.jpeg",
  },
  {
    id: 3,
    title: "Security Operations Intern",
    organization: "CYBERWELL Solutions",
    time: "April 2025 - September 2025",
    description: 
    "I conducted SOC assessments using tools like Cortex XDR and Exabeam TDIR to prevent security breaches.\n\n" +
    "I proposed SOC process improvements, including alert tuning logic and automation opportunities.",
    tags: ["Cortex", "Exabeam", "Entra ID", "MITRE ATT&CK"],
    logo: "/CYBERWELL.jpeg",
  },
  {
    id: 4,
    title: "Coding Tutor",
    organization: "Code Ninjas",
    time: "June 2024 - August 2024",
    description:
    "At Code Ninjas, I taught kids aged 7-14 how to code using Microsoft MakeCode Arcade, Scratch 3.0, Unity, and fun online games. \n\n" +
    "I also developed the curriculum for Code Ninja's \"Future Minds\" summer camp that introduces children to how AI models learn using fun online resources such as ML 4 Kids powered by IBM Watson, Scratch 3.0, and more! \n\n",
    tags: ["Microsoft MakeCode", "Scratch 3.0", "Unity", "ML 4 Kids with IBM Watson", "Curriculum Development"],
    logo: "/CN.png",
},
{
    id: 5,
    title: "IT Intern",
    organization: "WELL Health Technologies",
    time: "May 2023 - September 2023",
    description:
    "At WELL, I helped develop an agent that gathers device analytics & logs from devices in WELL subsidiaries. " +
    "I also ensured software security compliance with standards like HIPAA and ISO/IEC 27001 to protect sensitive patient data.",
    tags: ["Bash", "Azure"],
    logo: "/WELL.png",
},
];

export const ExperienceSection = () => {
  return (
    <section id="experience" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          {" "}
          My <span className="text-primary"> Experience </span>
        </h2>

        <p className="text-center mb-12 max-w-2xl mx-auto">
          These are the work and volunteer experiences that shape my skills in the software field.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, key) => (
            <div
              key={key}
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
                  {project.tags.map((tag) => (
                    <span className="px-2 py-1 text-xs font-medium border rounded-full bg-secondary text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};