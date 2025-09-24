import { useState } from "react";
import { cn } from "@/lib/utils";

const skills = [
  // Languages
  { name: "Python", level: 95, category: "languages" },
  { name: "Java", level: 95, category: "languages" },
  { name: "C", level: 95, category: "languages" },
  { name: "C++", level: 90, category: "languages" },
  { name: "SQL", level: 85, category: "languages" },
  { name: "PHP", level: 65, category: "languages" },
  { name: "Bash", level: 65, category: "languages" },
  { name: "HTML/CSS", level: 80, category: "languages" },
  { name: "JavaScript", level: 80, category: "languages" },
  { name: "Prolog", level: 60, category: "languages" },
  { name: "Scheme", level: 60, category: "languages" },

  // Tools & Frameworks
  { name: "React.js", level: 90, category: "tools" },
  { name: "Tailwind CSS", level: 90, category: "tools" },
  { name: "Flask", level: 70, category: "tools" },
  { name: "MySQL", level: 80, category: "tools" },
  { name: "Qt", level: 75, category: "tools" },
  
  { name: "Django", level: 50, category: "tools" },
  { name: "Express.js", level: 40, category: "tools" },
  { name: "Vue.js", level: 45, category: "tools" },
  { name: "Node.js", level: 50, category: "tools" },
  { name: "Next.js", level: 45, category: "tools" },
  { name: "Bootstrap", level: 55, category: "tools" },

  // Cloud & DevOps
  { name: "AWS", level: 70, category: "Cloud & DevOps" },
  { name: "GCP", level: 75, category: "Cloud & DevOps" },
  { name: "Firebase", level: 70, category: "Cloud & DevOps" },
  { name: "Azure", level: 80, category: "Cloud & DevOps" },
  { name: "Git", level: 85, category: "Cloud & DevOps" },
  { name: "Atlassian SaaS", level: 60, category: "Cloud & DevOps" },
  { name: "Docker", level: 50, category: "Cloud & DevOps" },
];

const categories = ["all", "languages", "tools", "Cloud & DevOps"];

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredSkills = skills.filter(
    (skill) => activeCategory === "all" || skill.category === activeCategory
  );
  return (
    <section id="skills" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          My <span className="text-primary"> Skills</span>
        </h2>

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
    </section>
  );
};