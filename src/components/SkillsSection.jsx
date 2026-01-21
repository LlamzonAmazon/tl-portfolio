import { useState } from "react";
import { cn } from "@/lib/utils";
import { ShinyText } from "./Animations/ShinyText";
import AnimatedContent from './Animations/AnimatedContent'
import skillsData from '../data/skills.json';

const skills = skillsData.skills;
const categories = skillsData.categories;

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState("Languages");

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
        initialOpacity={0}
        animateOpacity
        scale={1.0}
        threshold={0.12}
        delay={0}
      >

        <div className="container mx-auto max-w-5xl">

          <div className="liquid-glass-surface mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              My <span className="text-primary"> Skills</span>
            </h2>

            <ShinyText
              text="Most of my technical skillset comes from projects and school. I am trying to gain more experience with data analysis and machine learning libraries."
              disabled={false}
              speed={6}
              className='text-center text-muted-foreground text-sm md:text-base block mx-auto max-w-2xl'
            />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category, key) => (
              <button
                key={key}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground hover:shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    : "bg-secondary/70 text-foreground hover:text-primary transition-all duration-300 hover:scale-105 active:scale-95;"
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