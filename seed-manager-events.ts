import 'dotenv/config';
import prisma from './src/lib/prisma';

const eventsData = [
  {
    title: "Coldplay: Music Of The Spheres World Tour",
    description: "The global phenomenon brings their spectacular stadium show to Mumbai! Expect lasers, fireworks, and all their greatest hits.",
    location: "DY Patil Stadium, Mumbai",
    date: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), 
    startTime: "18:00",
    status: "UPCOMING",
    attendeeCategory: "Music & entertainment",
    duration: "4 Hours",
    language: "English",
    tags: "Pop, Rock, Concert",
    coverImageUrl: "https://images.unsplash.com/photo-1540039155732-d68a98b4b76a?q=80&w=2000&auto=format&fit=crop",
    bands: "Coldplay",
  },
  {
    title: "Arijit Singh Live in Concert",
    description: "Experience the soulful voice of Arijit Singh live. A mesmerizing evening of romance, heartbreak, and pure melody in Mumbai.",
    location: "Jio World Garden, BKC, Mumbai",
    date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), 
    startTime: "19:00",
    status: "UPCOMING",
    attendeeCategory: "Music & entertainment",
    duration: "3.5 Hours",
    language: "Hindi",
    tags: "Bollywood, Romantic, Live",
    coverImageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2000&auto=format&fit=crop",
    bands: "Arijit Singh",
  },
  {
    title: "Global Tech Summit 2026",
    description: "Join industry leaders and innovators for a weekend of AI, Web3, and future tech discussions in Delhi.",
    location: "Bombay Exhibition Centre, Mumbai",
    date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), 
    startTime: "09:00",
    status: "UPCOMING",
    attendeeCategory: "Corporate & networking",
    duration: "2 Days",
    language: "English",
    tags: "Tech, Networking, AI, Startups",
    coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop",
    bands: "Sam Altman, Elon Musk",
  },
  {
    title: "Zakir Khan - Tathastu Tour",
    description: "The sakht launda is back with a brand new special. Get ready for an evening of relatable anecdotes and non-stop laughter.",
    location: "Shanmukhananda Hall, Mumbai",
    date: new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000), 
    startTime: "20:00",
    status: "UPCOMING",
    attendeeCategory: "Music & entertainment",
    duration: "2 Hours",
    language: "Hindi",
    tags: "Comedy, Standup",
    coverImageUrl: "https://images.unsplash.com/photo-1527224857830-43a7eaa58c73?q=80&w=2000&auto=format&fit=crop",
    bands: "Zakir Khan",
  },
  {
    title: "Startup Hackathon: Build the Future",
    description: "48 hours of intense coding, prototyping, and pitching. Win massive cash prizes and seed funding in Hyderabad.",
    location: "T-Hub, Hyderabad",
    date: new Date(new Date().getTime() + 12 * 24 * 60 * 60 * 1000), 
    startTime: "10:00",
    status: "UPCOMING",
    attendeeCategory: "Hackathons & tech meets",
    duration: "48 Hours",
    language: "English",
    tags: "Coding, Hackathon, Developers",
    coverImageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2000&auto=format&fit=crop",
    bands: "",
  },
  {
    title: "Oasis '26 - BITS Pilani Cultural Fest",
    description: "The 96-hour continuous cultural extravaganza of BITS Pilani. Music, dance, drama, and art.",
    location: "BITS Pilani Campus, Hyderabad",
    date: new Date(new Date().getTime() + 45 * 24 * 60 * 60 * 1000), 
    startTime: "16:00",
    status: "UPCOMING",
    attendeeCategory: "Campus fests & culture nights",
    duration: "4 Days",
    language: "English, Hindi",
    tags: "College Fest, Cultural, Youth",
    coverImageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop",
    bands: "Amit Trivedi, The Local Train",
  },
  {
    title: "UI/UX Masterclass with Sarah D.",
    description: "A hands-on workshop covering advanced Figma prototyping, user research methodologies, and design systems.",
    location: "WeWork Galaxy, Bangalore",
    date: new Date(new Date().getTime() + 20 * 24 * 60 * 60 * 1000), 
    startTime: "10:00",
    status: "UPCOMING",
    attendeeCategory: "Workshops & skill-ups",
    duration: "8 Hours",
    language: "English",
    tags: "Design, Workshop, UI/UX",
    coverImageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
    bands: "",
  },
  {
    title: "Indie Rock Night at Hard Rock",
    description: "Discover the best upcoming indie rock bands. A night of pure unadulterated rock music in Chennai.",
    location: "Hard Rock Cafe, Chennai",
    date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), 
    startTime: "21:00",
    status: "UPCOMING",
    attendeeCategory: "Music & entertainment",
    duration: "4 Hours",
    language: "English",
    tags: "Indie, Rock, Live Bands",
    coverImageUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=2000&auto=format&fit=crop",
    bands: "Yellow Diary, Parvaaz",
  },
  {
    title: "Data Science Mega Job Fair",
    description: "Top companies hiring for Data Scientists, ML Engineers, and Data Analysts. On-the-spot interviews.",
    location: "KTPO Whitefield, Bangalore",
    date: new Date(new Date().getTime() + 18 * 24 * 60 * 60 * 1000), 
    startTime: "09:30",
    status: "UPCOMING",
    attendeeCategory: "Career & job fairs",
    duration: "8 Hours",
    language: "English",
    tags: "Careers, Hiring, Data Science",
    coverImageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2000&auto=format&fit=crop",
    bands: "",
  },
  {
    title: "Navratri Dandiya Nights",
    description: "Celebrate the festive season with non-stop Garba and Dandiya. Traditional attire mandatory!",
    location: "Nesco Grounds, Goregaon, Mumbai",
    date: new Date(new Date().getTime() + 25 * 24 * 60 * 60 * 1000), 
    startTime: "19:00",
    status: "UPCOMING",
    attendeeCategory: "Campus fests & culture nights",
    duration: "5 Hours",
    language: "Gujarati, Hindi",
    tags: "Cultural, Dance, Festival",
    coverImageUrl: "https://images.unsplash.com/photo-1604928141064-207cea6f5722?q=80&w=2000&auto=format&fit=crop",
    bands: "Falguni Pathak",
  },
  {
    title: "Startup Founders Mixer",
    description: "An exclusive networking evening for founders, VCs, and angel investors over cocktails in Delhi.",
    location: "Soho House, Delhi",
    date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), 
    startTime: "19:30",
    status: "UPCOMING",
    attendeeCategory: "Corporate & networking",
    duration: "3 Hours",
    language: "English",
    tags: "Networking, Startups, VC",
    coverImageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2000&auto=format&fit=crop",
    bands: "",
  },
  {
    title: "Comic Con India 2026",
    description: "The ultimate pop culture experience! Cosplay, merch, international artists, and exclusive reveals in Delhi.",
    location: "NSIC Exhibition Ground, Delhi",
    date: new Date(new Date().getTime() + 40 * 24 * 60 * 60 * 1000), 
    startTime: "11:00",
    status: "UPCOMING",
    attendeeCategory: "Music & entertainment",
    duration: "2 Days",
    language: "English",
    tags: "Pop Culture, Comics, Cosplay",
    coverImageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6ce846ce?q=80&w=2000&auto=format&fit=crop",
    bands: "",
  },
  {
    title: "Web3 Developer Bootcamp",
    description: "Learn to build smart contracts and DApps from scratch in this intensive weekend bootcamp in Chennai.",
    location: "WeWork Beach Road, Chennai",
    date: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), 
    startTime: "10:00",
    status: "UPCOMING",
    attendeeCategory: "Workshops & skill-ups",
    duration: "16 Hours",
    language: "English",
    tags: "Web3, Crypto, Coding",
    coverImageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f4ec651?q=80&w=2000&auto=format&fit=crop",
    bands: "",
  },
  {
    title: "Mood Indigo - IIT Bombay",
    description: "Asia's largest college cultural festival. Unforgettable nights, electrifying pro-shows, and infinite memories in Mumbai.",
    location: "IIT Bombay Campus, Powai, Mumbai",
    date: new Date(new Date().getTime() + 55 * 24 * 60 * 60 * 1000), 
    startTime: "17:00",
    status: "UPCOMING",
    attendeeCategory: "Campus fests & culture nights",
    duration: "4 Days",
    language: "English, Hindi",
    tags: "College Fest, Youth, EDM",
    coverImageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2000&auto=format&fit=crop",
    bands: "Nucleya, Shaan",
  },
  {
    title: "Bangalore Tech Summit 2026",
    description: "Silicon Valley of India brings together global tech minds for a massive showcase of AI breakthroughs and startups.",
    location: "Palace Grounds, Bangalore",
    date: new Date(new Date().getTime() + 22 * 24 * 60 * 60 * 1000), 
    startTime: "09:00",
    status: "UPCOMING",
    attendeeCategory: "Corporate & networking",
    duration: "3 Days",
    language: "English",
    tags: "Tech, Innovation, Startups, Bangalore",
    coverImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop",
    bands: "Nandan Nilekani, Kiran Mazumdar-Shaw",
  }
];

async function seed() {
  try {
    // 1. Create a Pro Manager
    let user = await prisma.user.findUnique({
      where: { email: "demomanager@backstage.com" }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "demomanager@backstage.com",
          name: "Joe Rock (Demo Manager)",
          password: "password123", // Plain text as per project auth system design
          role: "MANAGER",
        }
      });
      console.log("Created user: demomanager@backstage.com");
    }

    // 2. Create ManagerProfile with PRO tier
    const profile = await prisma.managerProfile.upsert({
      where: { userId: user.id },
      update: {
        company: "Rock Productions Ltd",
        bio: "Leading event organization and booking agency.",
        subscriptionTier: "PRO"
      },
      create: {
        userId: user.id,
        company: "Rock Productions Ltd",
        bio: "Leading event organization and booking agency.",
        subscriptionTier: "PRO"
      }
    });
    console.log(`Updated Manager Profile: ${profile.id} with tier: PRO`);

    // 3. Clear existing events for clean demo state if any
    const deleteRes = await prisma.event.deleteMany({
      where: { managerId: user.id }
    });
    console.log(`Cleared ${deleteRes.count} existing events for this manager.`);

    // 4. Seed the 15 events
    let count = 0;
    for (const event of eventsData) {
      await prisma.event.create({
        data: {
          ...event,
          managerId: user.id
        }
      });
      count++;
    }

    console.log(`Successfully seeded ${count} events under Manager demomanager@backstage.com!`);
  } catch (err) {
    console.error("Error seeding events:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
