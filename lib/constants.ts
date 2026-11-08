// ─── Brand Colors ────────────────────────────────────────────────────────────
export const colors = {
  glacierGrey: '#A5AFBD',
  frostWhite: '#DCE3EA',
  snowWhite: '#F5F7FA',
  arcticSlate: '#53647B',
  midnightIce: '#171F2D',
  paleIce: '#C2E1E8',
  digitalMagenta: '#D65BFF',
  prismaticBlue: '#6D9EFF',
} as const;

// ─── Navigation ──────────────────────────────────────────────────────────────
export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Tracks', href: '#tracks' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'FAQ', href: '#faq' },
] as const;

// ─── Event Metadata ──────────────────────────────────────────────────────────
export const eventMeta = {
  name: 'FROSTBYTE',
  tagline: 'Build Beyond the Ordinary.',
  description:
    'A 24-hour winter student hackathon where developers, designers and innovators come together to build, collaborate and solve real-world problems in an immersive retro-tech atmosphere.',
  format: '24-hour hackathon (12 + 12 format)',
  dates: 'To be announced',
  venue: 'To be announced',
  location: 'Delhi, India',
  registrationUrl: '#register',
} as const;

// ─── About Highlights ────────────────────────────────────────────────────────
export const aboutHighlights = [
  {
    title: '24 Hours of Building',
    description:
      'Two intense sessions of 12 hours each, designed to keep you focused, creative, and shipping real code.',
    icon: 'Clock' as const,
  },
  {
    title: 'Teams of Up to 4',
    description:
      'Collaborate with friends or meet new party members at the event. Solo questers are welcome too.',
    icon: 'Users' as const,
  },
  {
    title: 'Industry Problem Statements',
    description:
      'Tackle sponsor-provided challenges inspired by real-world engineering hurdles across industries.',
    icon: 'Target' as const,
  },
  {
    title: 'Network & Level Up',
    description:
      'Connect with industry mentors, engineering leads, and fellow builders throughout the winter journey.',
    icon: 'Zap' as const,
  },
] as const;

// ─── Event Timeline ──────────────────────────────────────────────────────────
export const eventTimeline = [
  {
    phase: 'Quest Start',
    title: 'Opening Ceremony & Problem Statement Reveal',
    description:
      'Gather at the campfire. Kick off with opening remarks, sponsor introductions, and the official release of quest tracks.',
    day: 'Day 1',
    time: 'TBA',
  },
  {
    phase: 'Session 01',
    title: 'Sprint Phase — Architecture & Dev',
    description:
      'First 12 hours of intense building. On-site mentors and technical leads assist teams with architecture and roadblocks.',
    day: 'Day 1',
    time: '12 Hours',
  },
  {
    phase: 'Session 02',
    title: 'Completion, Polish & Final Submission',
    description:
      'Final 12-hour sprint to refine features, prepare demo presentations, and commit final repositories to judging.',
    day: 'Day 2',
    time: '12 Hours',
  },
  {
    phase: 'Finale & Awards',
    title: 'Judging Demos & Victory Ceremony',
    description:
      'Showcase your creations to the judging council, celebrate standout projects, and announce the champions.',
    day: 'Day 2',
    time: 'TBA',
  },
] as const;

// ─── Tracks ──────────────────────────────────────────────────────────────────
export const tracks = [
  {
    title: 'HealthTech',
    description:
      'Build digital solutions improving healthcare accessibility, clinical operations, or patient wellness.',
    icon: 'HeartPulse' as const,
  },
  {
    title: 'FinTech',
    description:
      'Reimagine modern finance, decentralized protocols, micro-payments, or smart ledger management.',
    icon: 'Landmark' as const,
  },
  {
    title: 'EdTech',
    description:
      'Create game-changing tools transforming how students learn, collaborate, and master new skills.',
    icon: 'GraduationCap' as const,
  },
  {
    title: 'Sustainability',
    description:
      'Develop environmental computing solutions tackling carbon footprint, renewable energy, and green living.',
    icon: 'Leaf' as const,
  },
  {
    title: 'Open Innovation',
    description:
      'Have an uncontainable idea that transcends categories? Build any project that solves a genuine human challenge.',
    icon: 'Lightbulb' as const,
  },
  {
    title: 'Sponsor Challenges',
    description:
      'Tackle high-priority industry challenges designed specifically by our title and premier partners.',
    icon: 'Trophy' as const,
  },
] as const;

// ─── Sponsors ────────────────────────────────────────────────────────────────
export const sponsorTiers = [
  {
    tier: 'Title Sponsor',
    slots: 1,
    size: 'lg' as const,
  },
  {
    tier: 'Gold Sponsors',
    slots: 3,
    size: 'md' as const,
  },
  {
    tier: 'Community Partners',
    slots: 4,
    size: 'sm' as const,
  },
  {
    tier: 'Technology Partners',
    slots: 4,
    size: 'sm' as const,
  },
] as const;

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export const faqs = [
  {
    question: 'Who can enter FROSTBYTE?',
    answer:
      'FROSTBYTE is open to all students actively enrolled in undergraduate, postgraduate, or diploma programs. Both first-time builders and veteran hackathon questers are encouraged to join.',
  },
  {
    question: 'What is the permitted party size?',
    answer:
      'Teams can consist of 1 to 4 members. You can register with a pre-formed squad or team up with other solo hackers during the team-formation mixer at opening ceremony.',
  },
  {
    question: 'Is FROSTBYTE online or in-person?',
    answer:
      'FROSTBYTE is an in-person, on-site hackathon hosted in Delhi, India. All accepted teams will hack together at the physical venue for the entire 24-hour duration.',
  },
  {
    question: 'Is prior hackathon experience required?',
    answer:
      'Not at all. We celebrate beginners! Experienced mentors and industry professionals will be walking the floor around the clock to guide you through debugging, design, and ideation.',
  },
  {
    question: 'What gear should participants bring?',
    answer:
      'Bring your primary laptop, power brick, hardware kits if needed, personal toiletries, and a valid college ID card. We provide round-the-clock power, high-speed connectivity, hot meals, and caffeine.',
  },
  {
    question: 'How does registration & selection work?',
    answer:
      'Applications will open soon. Sign up individually or as a squad. Applications are reviewed on a rolling basis, and invitations will be sent out ahead of the event with venue logistics.',
  },
] as const;

// ─── Social Links ────────────────────────────────────────────────────────────
export const socialLinks = [
  { platform: 'Twitter', href: '#' },
  { platform: 'Instagram', href: '#' },
  { platform: 'LinkedIn', href: '#' },
  { platform: 'GitHub', href: '#' },
] as const;

export const contactEmail = 'hello@frostbyte.dev';
