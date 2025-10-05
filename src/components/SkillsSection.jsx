import { useState } from "react";
import { cn } from "@/lib/utils";
import { ShinyText } from "./Animations/ShinyText";
import AnimatedContent from './Animations/AnimatedContent'

const skills = [
  // Languages
  { name: "Python", level: 95, category: "languages" },
  { name: "Java", level: 95, category: "languages" },
  { name: "C", level: 95, category: "languages" },
  { name: "C++", level: 90, category: "languages" },
  { name: "SQL", level: 85, category: "languages" },
  { name: "JavaScript", level: 80, category: "languages" },
  { name: "HTML/CSS", level: 80, category: "languages" },
  { name: "PHP", level: 65, category: "languages" },
  { name: "Bash", level: 65, category: "languages" },

  // Tools & Frameworks
  { name: "Pandas", level: 70, category: "tools" },
  { name: "NumPy", level: 70, category: "tools" },
  { name: "PyTorch", level: 10, category: "tools" },
  { name: "TensorFlow", level: 0, category: "tools" },
  { name: "Scikit-Learn", level: 10, category: "tools" },
  { name: "Flask", level: 70, category: "tools" },
  { name: "REST APIs", level: 70, category: "tools" },
  { name: "MySQL", level: 80, category: "tools" },
  { name: "PostgreSQL", level: 80, category: "tools" },
  { name: "React.js", level: 90, category: "tools" },
  { name: "Qt", level: 75, category: "tools" },
  { name: "Tailwind CSS", level: 90, category: "tools" },

  // Cloud & DevOps
  { name: "Amazon Web Services", level: 70, category: "Cloud & DevOps" },
  { name: "Google Cloud Platform", level: 75, category: "Cloud & DevOps" },
  { name: "Google Firebase", level: 70, category: "Cloud & DevOps" },
  { name: "Microsoft Azure", level: 80, category: "Cloud & DevOps" },
  { name: "GitHub", level: 85, category: "Cloud & DevOps" },
  { name: "Atlassian Software", level: 60, category: "Cloud & DevOps" },
];

const categories = ["languages", "tools", "Cloud & DevOps"];

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("languages");

  const filteredSkills = skills.filter(
    (skill) => skill.category === activeCategory
  );
  return (
    <section id="skills" className="py-24 px-4 relative bg-secondary/30">
    <AnimatedContent
      distance={400}
      direction="horizontal"
      reverse={true}
      duration={1.6}
      ease="power3.out"
      initialOpacity={0.1}
      animateOpacity
      scale={1.0}
      threshold={0.2}
      delay={0}
    >

      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          My <span className="text-primary"> Skills</span>
        </h2>

        <ShinyText
          text="Most of my technical skillset comes from projects and school. I am trying to gain more experience with data analysis and machine learning frameworks and tools."
          disabled={false}
          speed={6}
          className='text-center text-muted-foreground mb-12 text-sm md:text-base block mx-auto max-w-2xl'
        />

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/70 text-forefround hover:bd-secondary"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, key) => (
            <div
              key={key}
              className="bg-card p-6 rounded-lg shadow-xs card-hover"
            >
              <div className="text-left mb-4">
                <h3 className="font-semibold text-lg"> {skill.name}</h3>
              </div>
              <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full origin-left animate-[grow_1.5s_ease-out]"
                  style={{ width: skill.level + "%" }}
                />
              </div>

              <div className="text-right mt-1">
                <span className="text-sm text-muted-foreground">
                  {skill.level}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </AnimatedContent>
    </section>
  );
};