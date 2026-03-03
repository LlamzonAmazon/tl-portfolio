import { Navbar }            from '../components/Navbar'
import { HeroSection }       from '../components/HeroSection'
import { AboutSection }      from '../components/AboutSection'
import { ProjectsSection }   from '../components/ProjectsSection'
import { ExperienceSection } from '../components/ExperienceSection'
import { SkillsSection }     from '../components/SkillsSection'
import { ContactSection }    from '../components/ContactSection'
import { Footer }            from '../components/Footer'

export const Home = () => (
  <div style={{ background: 'var(--color-bg)', color: 'var(--color-white)', overflowX: 'hidden' }}>
    <Navbar />
    <main>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <ExperienceSection />
      <SkillsSection />
      <ContactSection />
    </main>
    <Footer />
  </div>
)
