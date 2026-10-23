import { Hero } from '@/components/sections/Hero';
import { Philosophy } from '@/components/sections/Philosophy';
import { ServicesV2 } from '@/components/sections/ServicesV2';
import { Projects } from '@/components/sections/Projects';
import { Archive } from '@/components/sections/Archive';
import { Contact } from '@/components/sections/Contact';
import { WelcomeScreen } from '@/components/ui/WelcomeScreen';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is Akash Tripathi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Akash Tripathi is a Full Stack Developer and Systems Engineer from Kanpur, Uttar Pradesh, India, graduating in 2026 with a B.Tech in Computer Science & Engineering (Data Science) from JSS Academy of Technical Education, Noida. He builds production-grade web applications, distributed systems, and AI-powered products.',
      },
    },
    {
      '@type': 'Question',
      name: "What is Akash Tripathi's technical stack and expertise?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Akash specializes in full-stack engineering across TypeScript, Next.js, React 19, Node.js, Express, Go (Golang), PostgreSQL, Redis, Docker, and Python. His core focus includes distributed systems, real-time collaboration with WebSockets, caching layers, and LLM application engineering.',
      },
    },
    {
      '@type': 'Question',
      name: 'What notable projects has Akash Tripathi engineered?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Akash has developed several production-ready platforms including Kanbex (a distributed real-time Kanban platform with optimistic UI and Redis caching), Wizardry AI (an AI SaaS platform featuring streaming LLM orchestration and payments), Tasktrox (a full-stack SaaS project management tool built with Next.js and PostgreSQL), CodeRoom (a real-time collaborative coding platform using WebRTC), and Channel-X (a high-performance real-time messaging system).',
      },
    },
    {
      '@type': 'Question',
      name: 'What professional experience does Akash Tripathi have?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Akash worked as a Backend Developer Intern at Weya.ai, where he engineered a 3-tier audit logging middleware with Prisma atomic transactions on PostgreSQL, contributed to database migrations, and tracked multi-tenant superadmin activity on an AI voice calling system. He also builds production systems independently.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where is Akash Tripathi based and how can I contact him?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Akash Tripathi is based in Noida / Kanpur, India. You can contact him directly via email at akashtripathi.acad@gmail.com, connect on LinkedIn at https://www.linkedin.com/in/akash-tripathi-b18901263/, or explore his open-source work on GitHub at https://github.com/akash1723tripathi.',
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <WelcomeScreen />
      <main id="main-content">
        <Hero />
        <Philosophy />
        <ServicesV2 />
        <Projects />
        <Archive />
        <Contact />

        {/* Semantic FAQ section accessible to search and AI crawlers */}
        <section id="faq" className="sr-only" aria-label="Frequently Asked Questions">
          <h2>Frequently Asked Questions about Akash Tripathi</h2>
          <dl>
            {faqJsonLd.mainEntity.map((item, index) => (
              <div key={index}>
                <dt>{item.name}</dt>
                <dd>{item.acceptedAnswer.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
