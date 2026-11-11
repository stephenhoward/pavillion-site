/**
 * Fictional Larkspur Bend content (storyboard pavillion-social-clips--2026-11-10).
 * Week shown: Fri Nov 20 – Wed Nov 25, 2026. Times, places other than the
 * library, descriptions and the garden's category names are the builder's
 * guesses; the storyboard names only events, sources and the Seed Swap's
 * place, room, date and time.
 */
import type { EventPhotoKey } from '../ui/EventPhotos';

export type SourceKey = 'library' | 'market' | 'theater' | 'garden' | 'schools' | 'brewing';

export const SOURCES: Record<SourceKey, { name: string; color: string }> = {
  library: { name: 'Larkspur Bend Public Library', color: '#2563eb' },
  market: { name: 'Larkspur Bend Farmers Market', color: '#16a34a' },
  theater: { name: 'Bramble Street Theater', color: '#9333ea' },
  garden: { name: 'Larkspur Bend Community Garden', color: '#ca8a04' },
  schools: { name: 'Larkspur Bend School District', color: '#dc2626' },
  brewing: { name: 'Larkspur Bend Brewing Co.', color: '#0891b2' },
};

export const TOWN_CALENDAR = "What's On in Larkspur Bend";
export const GARDEN_CALENDAR = SOURCES.garden.name;

export type EventCardData = {
  id: string;
  day: string; // ISO date
  time: string;
  title: string;
  location: string;
  description: string;
  categories: string[];
  source: SourceKey;
  recurring?: boolean;
  image?: 'seedswap' | EventPhotoKey;
};

export const SEED_SWAP: EventCardData = {
  id: 'seed-swap',
  day: '2026-11-21',
  time: '1:00 PM – 3:00 PM',
  title: 'Seed Swap',
  location: 'Larkspur Bend Public Library — Community Room',
  description: 'Bring seeds, take seeds. Swap what you saved this year and leave with something new to plant in spring.',
  categories: ['Swaps', 'Workshops'],
  source: 'garden',
  image: 'seedswap',
};

export const SEED_SWAP_TITLE = SEED_SWAP.title;
export const SEED_SWAP_DESCRIPTION = SEED_SWAP.description;
export const GARDEN_CATEGORIES = ['Workshops', 'Swaps', 'Volunteer Days', 'Kids & Families'];

export const SATURDAY_OTHERS: EventCardData[] = [
  {
    id: 'bird-walk', day: '2026-11-21', time: '8:00 AM – 10:00 AM', title: 'Bird Walk on the River Trail',
    location: 'River Trail — North Trailhead', description: 'An easy two-mile walk with the library’s birding kits. Binoculars to borrow.',
    categories: ['Outdoors'], source: 'library', image: 'bird-walk',
  },
  {
    id: 'market', day: '2026-11-21', time: '9:00 AM – 1:00 PM', title: 'Saturday Market',
    location: 'Larkspur Bend Town Square', description: 'Local produce, bread, eggs and crafts from growers within thirty miles.',
    categories: ['Food & Drink'], source: 'market', image: 'market', recurring: true,
  },
  {
    id: 'matinee', day: '2026-11-21', time: '2:00 PM – 3:30 PM', title: 'Family Matinee',
    location: 'Bramble Street Theater', description: 'A short new play for ages five and up, with a crafts table after.',
    categories: ['Arts', 'Family'], source: 'theater', image: 'matinee',
  },
];

export const WEEK_OTHERS: EventCardData[] = [
  {
    id: 'basketball', day: '2026-11-20', time: '6:00 PM – 8:00 PM', title: 'Varsity Basketball',
    location: 'Larkspur Bend High School — Main Gym', description: 'Home opener for the season.',
    categories: ['Sports'], source: 'schools', image: 'basketball',
  },
  {
    id: 'live-music', day: '2026-11-20', time: '7:00 PM – 10:00 PM', title: 'Live Music Friday',
    location: 'Larkspur Bend Brewing Co.', description: 'Local bands on the taproom stage. No cover.',
    categories: ['Music'], source: 'brewing', recurring: true, image: 'live-music',
  },
  {
    id: 'work-party', day: '2026-11-22', time: '10:00 AM – 12:00 PM', title: 'Garden Work Party',
    location: 'Larkspur Bend Community Garden', description: 'Putting the beds to sleep for winter. Gloves and tools provided.',
    categories: ['Volunteer Days'], source: 'garden', image: 'work-party',
  },
  {
    id: 'story-hour', day: '2026-11-24', time: '10:30 AM – 11:15 AM', title: 'Story Hour',
    location: 'Larkspur Bend Public Library — Children’s Room', description: 'Picture books and songs for ages two to five.',
    categories: ['Family'], source: 'library', image: 'story-hour',
  },
  {
    id: 'karaoke', day: '2026-11-25', time: '8:00 PM – 11:00 PM', title: 'Karaoke Wednesday',
    location: 'Larkspur Bend Brewing Co.', description: 'Sign up at the bar from 7:30.',
    categories: ['Music'], source: 'brewing', image: 'karaoke',
  },
];

export const DAY_LABELS: Record<string, string> = {
  '2026-11-20': 'Friday, November 20',
  '2026-11-21': 'Saturday, November 21',
  '2026-11-22': 'Sunday, November 22',
  '2026-11-24': 'Tuesday, November 24',
  '2026-11-25': 'Wednesday, November 25',
};
