/*
  Single source of truth for every project shown on the monitor IDE.
  Each project is presented as a "source file" in the explorer — `file`,
  `folder` and `lang` drive the fake filesystem and syntax highlighting,
  the rest feeds the preview panel, code view and terminal.

  A project may carry a `gallery` of { src, label } screens instead of a
  single `image` — the phone frame turns that into a browsable carousel.

  TODO(muhannad): the Baity App + Dashboard entries still use generated
  mockup images (src/assets/projects/baity-app.svg, baity-dashboard.svg)
  and have no public links — drop real screenshots into src/assets/projects
  and fill `links.preview` when those URLs can be shared. (The Baity
  Website, both Finnair entries and all three Temrinak entries now use real
  captured screenshots.)
  NOTE(muhannad): confirm the finnair.com `tech` list + scope — it reflects
  agency (SEK) campaign/marketing work, not the in-house booking platform.
*/
import {
  project4,
  project5,
  project7,
  project10,
  project11,
  baityApp,
  baityDashboard,
  baityWebsiteShot,
  finnairShot,
  finnairCargoShot,
  temrinakWebsiteShot,
  temrinakDashboardShot,
  temrinakScreens,
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
    id: 'temrinak-app',
    file: 'app.tsx',
    folder: 'temrinak-platform',
    lang: 'tsx',
    type: 'mobile',
    title: 'Temrinak App',
    client: 'Personal product',
    role: 'Founder & Solo Developer',
    year: '2026',
    status: 'in development',
    blurb: 'The Iraqi fitness app — React Native & Expo.',
    description:
      'My own product, built end to end. Temrinak (تمرينك — “your workout”) is a fitness app that actually speaks Iraqi: over a thousand illustrated exercises, set-by-set logging with a live session timer, calorie tracking against a database of Iraqi food, coach-built programs, and friends to compete with. Written in Iraqi dialect first, with English and Kurdish alongside.',
    highlights: [
      'Iraqi-dialect Arabic UI — plus English & Kurdish',
      '1,000+ illustrated exercises with muscle maps',
      'Set-by-set logging with a live session timer',
      'Iraqi food database — calories & macros',
      'Trainers, friends and weekly leaderboards',
    ],
    tech: ['React Native', 'Expo', 'TypeScript', 'tRPC', 'i18n', 'RTL'],
    image: temrinakScreens.home,
    gallery: [
      { src: temrinakScreens.welcome, label: 'welcome · pick a language' },
      { src: temrinakScreens.home, label: 'home · today at a glance' },
      { src: temrinakScreens.program, label: 'program · week by week' },
      { src: temrinakScreens.session, label: 'live session · log a set' },
      { src: temrinakScreens.muscles, label: 'library · pick a muscle' },
      { src: temrinakScreens.library, label: 'library · exercise grid' },
      { src: temrinakScreens.addFood, label: 'nutrition · log a meal' },
      { src: temrinakScreens.friends, label: 'social · friends & ranking' },
      { src: temrinakScreens.trainers, label: 'social · find a trainer' },
    ],
    links: { preview: 'https://temrinak.app', github: '' },
    devHost: 'expo start · temrinak',
  },
  {
    id: 'temrinak-website',
    file: 'website.tsx',
    folder: 'temrinak-platform',
    lang: 'tsx',
    type: 'web',
    title: 'Temrinak Website',
    client: 'Personal product',
    role: 'Founder & Solo Developer',
    year: '2026',
    status: 'live',
    blurb: 'Product site and subscription flow — React + Vite.',
    description:
      'The storefront for Temrinak and the place people subscribe. An RTL-first, trilingual site (Arabic, English, Kurdish) on React and Vite, animated section by section, sharing the app’s account system so members sign in with the same credentials and unlock Temrinak Plus through local Iraqi payment rails.',
    highlights: [
      'RTL-first and trilingual — Arabic, English, Kurdish',
      'Sign-in shared with the mobile app’s backend',
      'Temrinak Plus checkout — monthly & yearly plans',
      'Local payment rails: ZainCash, FIB, Visa/Mastercard',
    ],
    tech: ['React', 'Vite', 'TypeScript', 'React Router', 'tRPC', 'TanStack Query'],
    image: temrinakWebsiteShot,
    links: { preview: 'https://temrinak.app', github: '' },
    devHost: 'temrinak.local:5173',
  },
  {
    id: 'temrinak-admin',
    file: 'admin.tsx',
    folder: 'temrinak-platform',
    lang: 'tsx',
    type: 'web',
    title: 'Temrinak Admin',
    client: 'Personal product',
    role: 'Founder & Solo Developer',
    year: '2026',
    status: 'in production',
    blurb: 'Content & operations console behind the platform.',
    description:
      'Everything the app serves is authored here. A bilingual content console for the exercise library, the Iraqi food and dish database, supplements, smoothies and diet plans — plus trainer approvals, user management, a support inbox, social moderation and coverage dashboards that show exactly which entries are still missing art or video.',
    highlights: [
      'Bilingual EN/AR exercise library — 1,000+ entries',
      'Foods, dishes, supplements, smoothies & diet plans',
      'Trainer approvals, users and a support inbox',
      'Coverage dashboards for missing media',
    ],
    tech: ['React', 'TypeScript', 'tRPC', 'TanStack Query', 'Analytics'],
    image: temrinakDashboardShot,
    links: { preview: '', github: '' },
    devHost: 'admin.temrinak.local:5174',
  },
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
    image: baityWebsiteShot,
    links: { preview: 'https://ibaity.com/', github: '' },
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
    id: 'finnair-cargo',
    file: 'finnair-cargo.php',
    folder: 'client-work',
    lang: 'php',
    type: 'web',
    title: 'Finnair Cargo',
    client: 'Finnair Cargo · via SEK',
    role: 'Web Developer',
    year: '2023',
    status: 'live',
    blurb: 'COOL terminal site + 360° interactive tour.',
    description:
      'Frontend work on Finnair Cargo (cargo.finnair.com) and its showpiece — the “COOL Terminal 360°”, an interactive walk-through of Helsinki’s COOL cargo hub built with Marzipano. Navigable panoramic scenes with story hotspots, plus design and content updates, new components and bug fixes across the WordPress site.',
    highlights: [
      'Interactive 360° terminal tour built with Marzipano',
      'Panoramic scenes with explorable story hotspots',
      'New components, design & content updates',
      'Cross-browser fixes across the WordPress site',
    ],
    tech: ['WordPress', 'PHP', 'JavaScript', 'Marzipano', 'GSAP', 'HTML', 'CSS'],
    image: finnairCargoShot,
    links: {
      preview: 'https://cargo.finnair.com/coolterminal360/',
      github: '',
    },
    devHost: 'finnair-cargo.local:8888',
  },
  {
    id: 'finnair',
    file: 'finnair.jsx',
    folder: 'client-work',
    lang: 'jsx',
    type: 'web',
    title: 'Finnair.com',
    client: 'Finnair · via SEK',
    role: 'Web Developer',
    year: '2023',
    status: 'live',
    blurb: 'Contributions to Finnair’s main web presence.',
    description:
      'Contributed to Finnair’s main web presence while at SEK — Finnair’s long-standing creative partner. Built and maintained interactive marketing and campaign pages and reusable UI components, focused on responsive layouts, cross-browser consistency and accessibility for one of the Nordics’ most-visited airline sites.',
    highlights: [
      'Interactive marketing & campaign pages',
      'Reusable, responsive UI components',
      'Cross-browser & accessibility passes',
      'Part of a long-running Finnair × SEK partnership',
    ],
    tech: ['JavaScript', 'React', 'SCSS', 'HTML', 'CSS', 'GSAP'],
    image: finnairShot,
    links: { preview: 'https://www.finnair.com/', github: '' },
    devHost: 'finnair.local:3000',
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
    tech: [
      'Next.js',
      'TypeScript',
      'React',
      'WordPress',
      'Headless CMS',
      'SCSS',
    ],
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
    tech: [
      'React',
      'Vite',
      'React Three Fiber',
      'three.js',
      'Blender',
      'Tailwind',
    ],
    image: project10,
    links: { preview: '/', github: '' },
    devHost: 'localhost:5173',
  },
];

/* explorer tree: folders in display order, root files last */
export const FOLDERS = ['temrinak-platform', 'baity-platform', 'client-work'];

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
