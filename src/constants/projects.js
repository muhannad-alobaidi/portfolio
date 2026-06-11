/*
  Single source of truth for every project shown on the monitor IDE.
  Each project is presented as a "source file" in the explorer — `file`,
  `folder` and `lang` drive the fake filesystem and syntax highlighting,
  the rest feeds the preview panel, code view and terminal.

  TODO(muhannad): the three Baity entries use generated mockup images
  (src/assets/projects/baity-*.svg) and no public links yet — drop real
  screenshots into src/assets/projects and fill `links.preview` when the
  product URLs can be shared.
*/
import {
  project4,
  project5,
  project7,
  project10,
  project11,
  baityApp,
  baityWebsite,
  baityDashboard,
} from '../assets';

export const LANG_META = {
  dart: { label: 'Dart', color: '#2cb7f6' },
  vue: { label: 'Vue', color: '#41b883' },
  php: { label: 'PHP', color: '#8892bf' },
  tsx: { label: 'TypeScript React', color: '#3178c6' },
  jsx: { label: 'JavaScript React', color: '#61dafb' },
  md: { label: 'Markdown', color: '#8fb8c9' },
};

export const PROJECTS = [
  {
    id: 'baity-app',
    file: 'app.dart',
    folder: 'baity-platform',
    lang: 'dart',
    type: 'mobile',
    title: 'Baity App',
    client: 'Baity',
    role: 'Lead Frontend Developer',
    year: '2026',
    status: 'in production',
    blurb: 'Cross-platform real-estate app built with Flutter.',
    description:
      'The Baity platform in your pocket — a cross-platform mobile app built with Flutter for iOS and Android. Property listings with rich search and filtering, saved favourites and a smooth Arabic-first experience, backed by a C#/ASP.NET API. I lead the frontend team shipping it.',
    highlights: [
      'One Flutter codebase → iOS + Android',
      'Arabic-first UI with full RTL support',
      'Listing search, filters & favourites',
      'Wired to a C#/ASP.NET REST API',
    ],
    tech: ['Flutter', 'Dart', 'REST API', 'C#', 'ASP.NET'],
    image: baityApp,
    links: { preview: '', github: '' },
    devHost: 'flutter run · baity-app',
  },
  {
    id: 'baity-website',
    file: 'website.vue',
    folder: 'baity-platform',
    lang: 'vue',
    type: 'web',
    title: 'Baity Website',
    client: 'Baity',
    role: 'Lead Frontend Developer',
    year: '2026',
    status: 'in production',
    blurb: 'Public real-estate platform website — Vue & Nuxt.',
    description:
      'The public face of the Baity platform, built with Vue and Nuxt. Server-side rendered for fast first paint and SEO, fully responsive and bilingual (Arabic / English with RTL). Browse, search and explore property listings — the storefront of the whole platform.',
    highlights: [
      'Nuxt SSR — fast first paint & SEO',
      'Bilingual AR/EN with RTL layouts',
      'Listing browse, search & detail pages',
      'Design system shared with the dashboard',
    ],
    tech: ['Vue', 'Nuxt', 'TypeScript', 'Tailwind', 'SSR', 'REST API'],
    image: baityWebsite,
    links: { preview: '', github: '' },
    devHost: 'baity.local:3000',
  },
  {
    id: 'baity-dashboard',
    file: 'dashboard.vue',
    folder: 'baity-platform',
    lang: 'vue',
    type: 'web',
    title: 'Baity Dashboard',
    client: 'Baity',
    role: 'Lead Frontend Developer',
    year: '2026',
    status: 'in production',
    blurb: 'Admin & analytics dashboard for the Baity platform.',
    description:
      'The control room of the Baity platform — an admin dashboard where listings, agents and content are managed. KPI overviews, charts and data tables built on Vue/Nuxt with role-based access, talking to the C#/ASP.NET backend. Built and maintained by the frontend team I lead.',
    highlights: [
      'Listings, agents & content management',
      'KPI cards, charts and data tables',
      'Role-based access control',
      'Leading a team of 2 frontend devs',
    ],
    tech: ['Vue', 'Nuxt', 'TypeScript', 'REST API', 'Charts'],
    image: baityDashboard,
    links: { preview: '', github: '' },
    devHost: 'dashboard.baity.local:3000',
  },
  {
    id: 'salomaa',
    file: 'salomaa.php',
    folder: 'client-work',
    lang: 'php',
    type: 'web',
    title: 'Salomaa',
    client: 'Salomaa',
    role: 'Frontend Developer',
    year: '2024',
    status: 'live',
    blurb: 'Full site renewal — WordPress, Tailwind & GSAP.',
    description:
      'Complete website renewal for Salomaa: new design, functionality and user experience. A modern look, better navigation and tuned performance — built on WordPress with Tailwind and GSAP-powered motion.',
    highlights: [
      'Full redesign & rebuild',
      'GSAP scroll animation & Swiper galleries',
      'Performance & accessibility pass',
    ],
    tech: ['WordPress', 'PHP', 'Tailwind', 'JavaScript', 'GSAP', 'Swiper'],
    image: project11,
    links: { preview: 'https://www.salomaa.fi/', github: '' },
    devHost: 'salomaa.local:8888',
  },
  {
    id: 'lagerblad',
    file: 'lagerblad.tsx',
    folder: 'client-work',
    lang: 'tsx',
    type: 'web',
    title: 'LagerBlad Foods',
    client: 'LagerBlad Foods',
    role: 'Frontend Developer',
    year: '2023',
    status: 'live',
    blurb: 'Headless WordPress + Next.js storefront site.',
    description:
      'WordPress stays the editors’ home; a Next.js frontend consumes it over REST for a fast, modern site. Headless architecture end to end — content modelling in WordPress, rendering and routing in React.',
    highlights: [
      'WordPress as a headless CMS',
      'Next.js frontend over the REST API',
      'AJAX-driven product listings',
    ],
    tech: ['React', 'Next.js', 'WordPress', 'SCSS', 'Headless CMS', 'REST API'],
    image: project5,
    links: { preview: 'https://www.lagerbladfoods.fi/', github: '' },
    devHost: 'lagerblad.local:3000',
  },
  {
    id: 'solarfoods',
    file: 'solarfoods.php',
    folder: 'client-work',
    lang: 'php',
    type: 'web',
    title: 'SolarFoods Story',
    client: 'Solar Foods',
    role: 'Frontend Developer',
    year: '2023',
    status: 'live',
    blurb: 'On-scroll brand-story sequence in WordPress.',
    description:
      'A brand-story page that walks visitors through the company journey with an on-scroll sequence — step-by-step visual storytelling that makes the brand’s mission stick, built as a custom WordPress experience.',
    highlights: [
      'On-scroll story sequence',
      'Custom WordPress build',
      'Memorable, immersive brand experience',
    ],
    tech: ['WordPress', 'PHP', 'jQuery', 'HTML', 'CSS'],
    image: project4,
    links: { preview: 'https://solarfoods.com/our-story/', github: '' },
    devHost: 'solarfoods.local:8888',
  },
  {
    id: 'sek',
    file: 'sek.tsx',
    folder: 'client-work',
    lang: 'tsx',
    type: 'web',
    title: 'SEK Website Renewal',
    client: 'SEK Oy',
    role: 'Frontend Developer',
    year: '2024',
    status: 'live',
    blurb: 'WordPress → headless migration with Next.js.',
    description:
      'Company website renewal for SEK, transforming a classic WordPress site into a headless architecture — TypeScript + Next.js on the front, WordPress as the content engine behind an API.',
    highlights: [
      'WordPress → headless migration',
      'Next.js + TypeScript frontend',
      'Component-driven architecture',
    ],
    tech: ['Next.js', 'TypeScript', 'React', 'WordPress', 'Headless CMS', 'SCSS'],
    image: project7,
    links: { preview: 'https://www.sek.fi/', github: '' },
    devHost: 'sek.local:3000',
  },
  {
    id: 'portfolio',
    file: 'portfolio.jsx',
    folder: null,
    lang: 'jsx',
    type: 'web',
    title: 'This Portfolio',
    client: 'Myself',
    role: 'Everything',
    year: '2026',
    status: 'live',
    blurb: 'The 3D workstation you are inside right now.',
    description:
      'The site you are looking at — from inside its own monitor. React + Vite with a three.js workstation scene modelled in Blender, GPU particle hero, a neural-index brain and this very IDE you are reading this in.',
    highlights: [
      'React Three Fiber 3D scene',
      'Custom Blender model & animations',
      'GPU particle hero section',
      'Recursive: you are viewing it on its own screen',
    ],
    tech: ['React', 'Vite', 'React Three Fiber', 'three.js', 'Blender', 'Tailwind'],
    image: project10,
    links: { preview: '/', github: '' },
    devHost: 'localhost:5173',
  },
];

/* explorer tree: folders in display order, root files last */
export const FOLDERS = ['baity-platform', 'client-work'];

export const projectsInFolder = folder =>
  PROJECTS.filter(p => p.folder === folder);

export const rootProjects = PROJECTS.filter(p => p.folder === null);

export const getProject = id => PROJECTS.find(p => p.id === id);

/* loose matcher for the terminal's `open` command */
export const matchProject = query => {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  return (
    PROJECTS.find(p => p.id === q || p.file.toLowerCase() === q) ||
    PROJECTS.find(
      p =>
        p.id.includes(q) ||
        p.file.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q)
    ) || null
  );
};
