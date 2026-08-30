// Prisma Seed — 69 Ganpati Pandals: Pune(22) · Mumbai(17) · Nashik(7) · Nagpur(7) · Satara(8) · Kolhapur(1) · Solapur(2) · Thane(2) · Kalyan-Dombivli(1) · Chhatrapati Sambhajinagar(2)
//
// COORDINATE NOTES (read before deploying):
// Every entry below was cross-checked against Google Places listings for the named
// mandal/temple. Most are precise to the building/gate. A handful of small,
// informal neighbourhood mandals (marked "// approx" below) could not be matched to
// a single confidently-identified listing — for those the original locality-center
// coordinates were kept as a reasonable placeholder. Since pandal exact footprints
// can also shift slightly year to year (temporary structures, permits), treat every
// pin as "correct to the street/market", and consider letting users submit a
// correction pin — it pairs naturally with your existing FIND_UNKNOWN quest type.
import "dotenv/config";
import { PrismaClient, PandalStatus, QuestType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { BADGE_DEFINITIONS } from "../lib/badge-config";

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/^["']|["']$/g, "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const connectionString = sanitizeEnv(process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: connectionString || undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


const PANDALS = [
  // ──────────────── PUNE (22) ────────────────
  {
    name: "Kasba Ganpati",
    description: "The Manacha Pahila — Pune's Gram Devata (city deity), tied to Jijabai and the Maratha Empire. The first of the five most-honoured Ganpatis and the one that leads the immersion procession.",
    latitude: 18.5190414,
    longitude: 73.8573208,
    address: "159, Kasba Peth Rd, Kasba Peth, Pune, Maharashtra 411011",
    city: "Pune",
    aartiTimes: JSON.stringify(["05:30", "12:00", "20:00"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Tambdi Jogeshwari",
    description: "Manacha Dusra — the second most-honoured Ganpati, sharing its shrine with Pune's red-hued Gramdevata Durga idol. Famous for its dhol-tasha-heavy procession.",
    latitude: 18.5165556,
    longitude: 73.8547939,
    address: "33/A, Budhwar Peth Rd, Budhwar Peth, Pune, Maharashtra 411002",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:30"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Guruji Talim Ganpati",
    description: "Manacha Tisra — third in the Manacha hierarchy, founded jointly by Hindu and Muslim families as a symbol of communal harmony, predating the citywide Sarvajanik Ganeshotsav.",
    latitude: 18.5157231,
    longitude: 73.8550528,
    address: "Jogeshwari Ln, opp. Guruji Talim Mandal, Budhwar Peth, Pune, Maharashtra 411002",
    city: "Pune",
    aartiTimes: JSON.stringify(["05:45", "12:00", "20:00"]),
    established: 1887,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Tulshibaug Ganpati",
    description: "Manacha Chautha — fourth most-honoured, set inside the historic Tulshibaug market lane.",
    latitude: 18.5142564,
    longitude: 73.8553109,
    address: "82, Budhwar Peth Rd, Tulshibaug, Budhwar Peth, Pune, Maharashtra 411002",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:00", "12:30", "20:00"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Kesariwada Ganpati",
    description: "Manacha Pachva — the fifth most-honoured Ganpati, based at Lokmanya Tilak's historic Kesariwada residence, which also houses a small Tilak museum.",
    latitude: 18.5157666,
    longitude: 73.8489088,
    address: "577, NC Kelkar Road, Narayan Peth, Pune, Maharashtra 411030",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:30"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shrimant Dagdusheth Halwai Ganpati",
    description: "Pune's most-visited Ganpati, famous for its gold-adorned idol and near round-the-clock queues that run well past midnight.",
    latitude: 18.5164157,
    longitude: 73.8560495,
    address: "Ganpati Bhavan, 250, Budhwar Peth, Pune, Maharashtra 411002",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:00", "08:00", "12:00", "16:00", "23:00"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shrimant Bhausaheb Rangari Ganpati",
    description: "The very first Sarvajanik (public) Ganeshotsav in India, started in 1892 by freedom fighter Bhausaheb Rangari a year before Tilak popularised the public festival. The idol depicts Ganesh slaying a demon.",
    latitude: 18.5175403,
    longitude: 73.8553125,
    address: "662/657, Bhau Rangari Road, Budhwar Peth, Pune, Maharashtra 411002",
    city: "Pune",
    aartiTimes: JSON.stringify(["08:00", "13:00", "20:30"]),
    established: 1892,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shanipar Mandal Ganpati",
    description: "133-year-old Sadashiv Peth institution known for its large-scale, technically ambitious annual theme sets (past years have recreated entire temple cities).",
    latitude: 18.5126026,
    longitude: 73.8525604,
    address: "Shashikant Gogvale Path, opp. Shanipar Bus Stop, Sadashiv Peth, Pune, Maharashtra 411030",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    established: 1892,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Parvatinandan Ganpati (Khinditla Ganpati)",
    description: "A 17th-century temple near Chattushringi with a UNESCO Asia-Pacific honourable mention for heritage conservation; believed to have been worshipped by Rajmata Jijabai.",
    latitude: 18.5411777,
    longitude: 73.8290758,
    address: "Ganeshkhind Road, Gokhalenagar, Pune, Maharashtra 411016",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:00"]),
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Mati Ganpati Mandal",
    description: "A century-old Narayan Peth mandal whose idol is traditionally crafted from clay ('mati') on-site — one of the few pandals that still performs live devotional street theatre during the festival.",
    latitude: 18.5159410,
    longitude: 73.8469283,
    address: "160, NC Kelkar Road, Pulachi Wadi, Narayan Peth, Pune, Maharashtra 411030",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "19:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Akhil Mandai Mandal",
    description: "A well-loved pandal tucked beside Pune's historic Mahatma Phule Mandai market in Shukrawar Peth, known for one of the city's most devotional aartis.",
    latitude: 18.5116942,
    longitude: 73.8561876,
    address: "59, Chavhan Rd, near Mandai, Shukrawar Peth, Pune, Maharashtra 411002",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Kothrud Adhipati (Hindustani Mitra Mandal)",
    description: "West Pune's biggest draw, run by the Samaj Sudharak Hindustani Mitra Mandal — locally known simply as 'Kothrud Adhipati'.",
    latitude: 18.5090087,
    longitude: 73.8109183,
    address: "Jay Bhavani Nagar, Kothrud, Pune, Maharashtra 411038",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Kalyani Nagar Mitra Mandal Ganesh Mandir",
    description: "A serene, well-organised pandal that has become a landmark for the Kalyani Nagar / Vishrantwadi belt of north Pune.",
    latitude: 18.5467932,
    longitude: 73.9016890,
    address: "107, Central Ave, Kalyani Nagar, Pune, Maharashtra 411006",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "19:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shree Ganesh Mitra Mandal, Hadapsar",
    description: "Community-run Hadapsar pandal offering prasad and cultural programs throughout the 10-day festival.",
    latitude: 18.5067605,
    longitude: 73.9362249,
    address: "Hadapsar Bridge, Malwadi, Hadapsar, Pune, Maharashtra 411028",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Viman Nagar Ganesh Mandal", // approx — locality-center pin, specific mandal not independently confirmed
    description: "Young, vibrant pandal near the airport colony, known for creative annual idol themes.",
    latitude: 18.5644,
    longitude: 73.9141,
    address: "Viman Nagar, Pune, Maharashtra",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Lokmanya Mitra Mandal Ganesh Mandir",
    description: "Long-running Aundh Gaon pandal serving the ward's old village core alongside the newer high-rises around it.",
    latitude: 18.5653137,
    longitude: 73.8110280,
    address: "Ward No. 8, Aundh Gaon, Pune, Maharashtra 411067",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Bharat Nagar Mitra Mandal Ganesh Mandir",
    description: "South Pune's Katraj-area community pandal near Katraj Lake, known for Marathi cultural programs.",
    latitude: 18.4329707,
    longitude: 73.8671859,
    address: "Sundar Nagar, Katraj, Pune, Maharashtra 411046",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:30", "12:00", "19:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shri Chhatrapati Mitra Mandal Ganesh Mandir",
    description: "Emerging Wakad pandal serving the fast-growing Pimpri-Chinchwad IT corridor.",
    latitude: 18.5972406,
    longitude: 73.7739225,
    address: "Mankar Chowk Rd, Wakad, Pimpri-Chinchwad, Maharashtra 411057",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Camp Area Ganesh Mandal", // approx — locality-center pin, specific mandal not independently confirmed
    description: "The cosmopolitan Camp area comes alive with this pandal blending traditional and modern elements.",
    latitude: 18.5192,
    longitude: 73.8810,
    address: "Camp, Pune, Maharashtra",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Baner Ganesh Utsav Mandal", // approx — locality-center pin, specific mandal not independently confirmed
    description: "IT-hub Baner's biggest pandal, known for decorations inspired by current events and social messages.",
    latitude: 18.5590,
    longitude: 73.7868,
    address: "Baner, Pune, Maharashtra",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Akhil Ganeshmala Mitra Mandal",
    description: "Sinhagad Road-area pandal in Ganesh Mala, Dattawadi — a longstanding neighbourhood fixture.",
    latitude: 18.4960531,
    longitude: 73.8374931,
    address: "Sinhgad Rd, Ganesh Mala, Dattawadi, Pune, Maharashtra 411030",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },

  // ──────────────── MUMBAI (17) ────────────────
  {
    name: "Lalbaugcha Raja",
    description: "Mumbai's most famous Ganpati, the 'King of Lalbaug', known as the wish-fulfilling Lord. Draws multi-hour, sometimes multi-day queues from across India.",
    latitude: 18.9909364,
    longitude: 72.8373348,
    address: "Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal, Dr Babasaheb Ambedkar Marg, Lal Baug, Mumbai, Maharashtra 400012",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["05:00", "08:00", "12:30", "16:00", "20:00"]),
    established: 1934,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "GSB Seva Mandal (King's Circle)",
    description: "Widely reported to be India's wealthiest Ganpati, with gold and silver decorations worth crores, run by the Gaud Saraswat Brahmin community.",
    latitude: 19.0291727,
    longitude: 72.8583943,
    address: "65/11, R.A. Kidwai Marg, Matunga East, Mumbai, Maharashtra 400019",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["05:30", "12:00", "20:30"]),
    established: 1954,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Khetwadi Cha Shree Ganesha",
    description: "One of the well-known Ganpatis in Khetwadi's dense lattice of festival lanes, each with its own distinct theme every year.",
    latitude: 18.9602460,
    longitude: 72.8219442,
    address: "Khemraj Srikrishna Das Marg, Khetwadi, Girgaon, Mumbai, Maharashtra 400004",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Chinchpoklicha Chintamani",
    description: "If Lalbaugcha Raja is the King, this 100+ year old mandal is 'the Emotion' of Mumbai — famous for its Aagman Sohala arrival ceremony, one of the city's biggest street parties.",
    latitude: 18.9880993,
    longitude: 72.8332544,
    address: "Dattaram Lad Marg, Chinchpokli, Mumbai, Maharashtra 400012",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:30"]),
    established: 1920,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Andheri Cha Raja",
    description: "Known as the King of the Suburbs. Uniquely, the idol is immersed several days after Anant Chaturdashi rather than on the festival's last day.",
    latitude: 19.1298063,
    longitude: 72.8365663,
    address: "Sports Complex, JP Rd, Munshi Nagar, Andheri West, Mumbai, Maharashtra 400053",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    established: 1966,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Raja Tejukayacha",
    description: "One of Mumbai's oldest Sarvajanik mandals, sited directly opposite Lalbaugcha Raja's entrance gate — a quieter darshan with just as much history.",
    latitude: 18.9935582,
    longitude: 72.8356929,
    address: "Tejukaya Building, Dr Babasaheb Ambedkar Rd, Ganesh Gully, Lal Baug, Mumbai, Maharashtra 400012",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:30"]),
    established: 1967,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Ganesh Galli Cha Raja (Mumbaicha Raja)",
    description: "Famous for elaborate annual replicas of famous Indian temples, and generally an easier, more accessible darshan than its Lalbaug neighbour.",
    latitude: 18.9939838,
    longitude: 72.8373458,
    address: "Ganesh Galli, Lal Baug, Parel, Mumbai, Maharashtra 400012",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Chembur Cha Raja",
    description: "A landmark eastern-suburb Ganpati whose idol is often tall enough to touch the pandal ceiling.",
    latitude: 19.0457925,
    longitude: 72.8970233,
    address: "CG Rd, Chembur Colony, Chembur, Mumbai, Maharashtra 400074",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Borivali Cha Raja (Shiv Mitra Mandal)",
    description: "One of the largest and oldest mandals in Borivali East, recently marking its golden jubilee.",
    latitude: 19.2240528,
    longitude: 72.8586460,
    address: "Dattapada Rd, Asara Colony, Borivali East, Mumbai, Maharashtra 400066",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Girgaon Cha Raja",
    description: "Mumbai's second-oldest mandal (est. 1928), nicknamed the 'King of Eco-friendly' for its all-clay, no-plaster-of-paris idol tradition.",
    latitude: 18.9548496,
    longitude: 72.8203697,
    address: "Nikadwari Lane, Charni Road East, Girgaon, Mumbai, Maharashtra 400004",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:00"]),
    established: 1928,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Ghatkopar Cha Raja",
    description: "One of the biggest pandals in the eastern suburbs, known for elaborate tableaux depicting the full Hindu pantheon around the central idol.",
    latitude: 19.0809590,
    longitude: 72.9042704,
    address: "Laxminarayan Lane, opp. Gandhi Market, Pant Nagar, Ghatkopar East, Mumbai, Maharashtra 400077",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["08:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Powai Ganesh Mandal (Hanuman Mitra Mandal)",
    description: "A vibrant, youth-run pandal serving the Powai / IIT market community.",
    latitude: 19.1250862,
    longitude: 72.9199381,
    address: "Hanuman Rd, IIT Market, Powai, Mumbai, Maharashtra 400076",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["09:00", "13:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Malad Cha Raja (Goraswadi Mitra Mandal)",
    description: "A beloved western-suburb Ganpati known for accessibility support for elderly devotees.",
    latitude: 19.1952698,
    longitude: 72.8463460,
    address: "Goraswadi Rd, Kandivali West, Mumbai, Maharashtra 400064",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Vasai Ganpati Mandal",
    description: "The Bal Gopal Sarvajanik Maghi Ganesh Utsav Mandal, celebrating both the monsoon and Magh (winter) Ganesh festivals for the Nalasopara/Vasai belt.",
    latitude: 19.4133034,
    longitude: 72.8265306,
    address: "Achole Rd, Nalasopara East, Vasai-Virar, Maharashtra 401209",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:30", "12:00", "19:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Keshavji Naik Chawl Ganeshotsav",
    description: "Widely credited as Mumbai's very first Sarvajanik Ganeshotsav (established the same year Lokmanya Tilak popularised the public festival). No lines, no fanfare — pure old-Mumbai devotion inside a historic chawl.",
    latitude: 18.9546037,
    longitude: 72.8221219,
    address: "Keshavji Naik Chawl, Khadilkar Rd, Girgaon, Mumbai, Maharashtra 400004",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["05:00", "12:00", "21:00"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Vile Parle Cha Vighnesh",
    description: "Locally called 'Navsala Pavnara Vighnesh' (the wish-granting Vighnesh) — one of Vile Parle's most visited mandals.",
    latitude: 19.1017905,
    longitude: 72.8536503,
    address: "Sant Janabai Rd, Navpada, Vile Parle East, Mumbai, Maharashtra 400057",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Century Cha Sukhakarta",
    description: "A Worli mandal within the old Century Mills colony grounds, part of south-central Mumbai's mill-land Ganeshotsav tradition.",
    latitude: 19.0071170,
    longitude: 72.8206880,
    address: "Century Colony, Worli, Mumbai, Maharashtra 400030",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },

  // ──────────────── NASHIK (7) ────────────────
  {
    name: "Shri Ganesh Bhakta Mandal, Shalimar",
    description: "Nashik's most-visited pandal, prominently located in the old-city Saraf Bazar / Shalimar market center.",
    latitude: 20.0047669,
    longitude: 73.7892459,
    address: "44, Palnitkar Ln, Saraf Bazar, Shalimar, Nashik, Maharashtra 422001",
    city: "Nashik",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shri Siddhivinayak Chandicha Ganpati",
    description: "A 90+ year old Panchavati landmark, known as 'Chandicha Ganapati' for its silver-clad idol, which devotees say is gradually re-coated and grown larger year after year.",
    latitude: 20.0065160,
    longitude: 73.7895770,
    address: "Sarkar Wada, Raviwar Karanja, Panchavati, Nashik, Maharashtra 422001",
    city: "Nashik",
    aartiTimes: JSON.stringify(["05:30", "12:00", "19:30"]),
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shree Ganpati Mandir, Mahatma Nagar",
    description: "A well-organised temple-and-pandal complex with a disciplined entry system, playground, and jogging track on the same grounds.",
    latitude: 19.9971712,
    longitude: 73.7526486,
    address: "Playground, Mahatma Nagar, Nashik, Maharashtra 422005",
    city: "Nashik",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Jay Shankar Yuva Mitra Mandal, Satpur",
    description: "The industrial Satpur colony's community pandal, known for electrifying dhol-tasha performances and eco-friendly idols.",
    latitude: 19.9900441,
    longitude: 73.7263166,
    address: "MHB Colony, Satpur Colony, Nashik, Maharashtra 422007",
    city: "Nashik",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Maha Ganpati Temple, Cidco",
    description: "A modern pandal serving Nashik's rapidly growing CIDCO new-town area, just off the Pune-Shirdi highway.",
    latitude: 19.9663053,
    longitude: 73.7555216,
    address: "Shivpuri Chowk, Uttam Nagar, Cidco, Nashik, Maharashtra 422008",
    city: "Nashik",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Varad Vinayak Ganpati Mandir",
    description: "A calm, spacious pandal on Nashik's busy Gangapur Road, popular for its peaceful morning and evening aarti.",
    latitude: 20.0128827,
    longitude: 73.7600727,
    address: "S.T. Colony, Gangapur Rd, Nashik, Maharashtra 422013",
    city: "Nashik",
    aartiTimes: JSON.stringify(["07:30", "12:00", "20:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Nashik Road Ganesh Mandal", // approx — locality-center pin, specific mandal not independently confirmed
    description: "One of the oldest and most traditional pandals in Nashik, near the railway station area.",
    latitude: 20.0098,
    longitude: 73.8184,
    address: "Nashik Road, Nashik, Maharashtra",
    city: "Nashik",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },

  // ──────────────── NAGPUR (7) ────────────────
  {
    name: "Shri Ganesh Mandir Tekdi",
    description: "Nagpur's most famous Ganpati, sitting on a small hill (tekdi) beside the railway station. The idol — around 250 years old by temple lore — is believed to have grown in size over time.",
    latitude: 21.1481232,
    longitude: 79.0867902,
    address: "Ganesh Tekdi Rd, Sitabuldi, Nagpur, Maharashtra 440001",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["05:30", "12:00", "20:00"]),
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Ganeshpeth Ganpati", // approx — locality-center pin, specific mandal not independently confirmed
    description: "Located in the historic Ganeshpeth area, considered the city's cultural heart during the festival.",
    latitude: 21.1440,
    longitude: 79.0862,
    address: "Ganeshpeth, Nagpur, Maharashtra",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    established: 1900,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shree Ganesh Utsav Mandal, Dharampeth",
    description: "Nagpur's upscale Dharampeth area hosts this well-managed pandal with quality cultural programs.",
    latitude: 21.1423473,
    longitude: 79.0665906,
    address: "Gali No. 4, VIP Rd, Dharampeth, Nagpur, Maharashtra 440010",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Tarun Hind Samaj Ganesh Utsav Mandal, Sitabuldi",
    description: "Central Nagpur's most accessible pandal, near Sitabuldi Fort and Rahul Bazar Complex.",
    latitude: 21.1440665,
    longitude: 79.0842696,
    address: "Rahul Bazar Complex, Sitabuldi, Nagpur, Maharashtra 440012",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shree Pragati Bal Ganesh Utsav Mandal, Sadar",
    description: "A youth-run Sadar cantonment pandal known for a fresh, creative theme every single year.",
    latitude: 21.1635890,
    longitude: 79.0743350,
    address: "opp. Jain Temple Marg, Sadar, Nagpur, Maharashtra 440001",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Bal Ganesh Utsav Mandal, Mahal",
    description: "The historic Mahal area of Nagpur celebrates Ganesh Chaturthi with great fervour at this traditional pandal.",
    latitude: 21.1418670,
    longitude: 79.1124500,
    address: "990B, Mangalwari, Mahal, Nagpur, Maharashtra 440032",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Gajanan Nagar Ganesh Pandal, Wardha Road",
    description: "One of Nagpur's oldest mandals, on the important Wardha Road corridor, known for elaborate temple-replica themes.",
    latitude: 21.1124823,
    longitude: 79.0760178,
    address: "34, Wardha Rd, Gajanan Nagar, Nagpur, Maharashtra 440015",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },

  // ──────────────── SATARA (8) ────────────────
  {
    name: "Rajwada Ganpati",
    description: "Set beside the historic Rajwada royal palace complex in Satara, carrying a legacy tied to Maratha royal tradition.",
    latitude: 17.6839761,
    longitude: 73.9887675,
    address: "Rajwada Cir, Bhavani Peth, Satara, Maharashtra 415002",
    city: "Satara",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    established: 1905,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shri Garecha Ganpati (Mangalwar Peth)",
    description: "One of Satara's oldest and most-loved temple-pandals, well maintained across generations by the Abhyankar family.",
    latitude: 17.6810452,
    longitude: 73.9820436,
    address: "Krishnewar, Chimanpura Peth, Satara, Maharashtra 415002",
    city: "Satara",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Char Bhinti Ganesh Mandal",
    description: "Pandal held near the iconic Char Bhinti memorial and viewpoint at the foot of Ajinkyatara Fort — come for darshan, stay for the best sunset view in Satara.",
    latitude: 17.6834969,
    longitude: 74.0026875,
    address: "Char Bhinti, Kesarkar Peth, Satara, Maharashtra 415001",
    city: "Satara",
    aartiTimes: JSON.stringify(["07:00", "12:00", "19:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Powai Naka Sarvajanik Ganpati Mandal", // approx — locality-center pin, specific mandal not independently confirmed
    description: "Located at Satara's central transit hub, attracting thousands of daily devotees.",
    latitude: 17.6914,
    longitude: 73.9984,
    address: "Powai Naka, Satara, Maharashtra",
    city: "Satara",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Saptara Ganesh Utsav Mandal, Guruwar Peth",
    description: "A Guruwar Peth neighbourhood pandal known for its eco-friendly celebration.",
    latitude: 17.6779625,
    longitude: 73.9925885,
    address: "Guruwar Peth, Satara, Maharashtra 415002",
    city: "Satara",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Samrat Ganpati Mandal, Malhar Peth",
    description: "Devotee-favourite pandal in historic Malhar Peth, close to Khan Ali market.",
    latitude: 17.6850122,
    longitude: 73.9915816,
    address: "Khan Ali, Malhar Peth, Satara, Maharashtra 415002",
    city: "Satara",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Sadashiv Peth Ganpati Satara", // approx — locality-center pin, specific mandal not independently confirmed
    description: "Vibrant community pandal in Sadashiv Peth Satara, known for charitable work and prasad distribution.",
    latitude: 17.6895,
    longitude: 74.0012,
    address: "Sadashiv Peth, Satara, Maharashtra",
    city: "Satara",
    aartiTimes: JSON.stringify(["07:00", "12:00", "19:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Moti Chowk Ganpati Mandal", // approx — locality-center pin, specific mandal not independently confirmed
    description: "Historic market-square pandal in Moti Chowk with traditional lamps and decorations.",
    latitude: 17.6861,
    longitude: 74.0062,
    address: "Moti Chowk, Satara, Maharashtra",
    city: "Satara",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },

  // ──────────────── KOLHAPUR (1) — new city ────────────────
  {
    name: "21 Feet Ganpati Idol",
    description: "A striking 21-foot eco-friendly Ganesh idol at Nagar Chowk that is not immersed each year — a deliberate, widely-praised break from the usual visarjan tradition to protect the local river.",
    latitude: 16.6910388,
    longitude: 74.2427393,
    address: "Nagar Chowk, Pratibhanagar Main Rd, Yadav Nagar, Kolhapur, Maharashtra 416008",
    city: "Kolhapur",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    isRare: true,
    status: PandalStatus.APPROVED,
  },

  // ──────────────── SOLAPUR (2) — new city ────────────────
  {
    name: "Manacha Shree Ajoba Ganpati Mandir",
    description: "Locally celebrated as India's very first Ganesh Mandal — roughly 136 years old — and said to have directly inspired Lokmanya Tilak to start the public Ganeshotsav movement.",
    latitude: 17.6773105,
    longitude: 75.9086324,
    address: "Manik Chowk, Guruwar Peth, Solapur, Maharashtra 413002",
    city: "Solapur",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    established: 1890,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Kasba Ganpati Pratishthan, Solapur",
    description: "One of Solapur's oldest Ganesh teams, near Balives in the heart of the old city.",
    latitude: 17.6804648,
    longitude: 75.9056387,
    address: "Balives Rd, Kasba, Solapur, Maharashtra 413002",
    city: "Solapur",
    aartiTimes: JSON.stringify(["05:00", "13:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },

  // ──────────────── THANE (2) — new city ────────────────
  {
    name: "Thanyacha Maharaja",
    description: "One of Thane's best-known and most powerful-looking Ganpati idols, tucked into Kisan Nagar despite tricky monsoon access roads.",
    latitude: 19.1886536,
    longitude: 72.9512906,
    address: "Kisan Nagar 1, Thane West, Thane, Maharashtra 400604",
    city: "Thane",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Hindu Jagruti Sarvajanik Ganeshotsav Mandal",
    description: "A well-regarded Naupada mandal, run by the same trust that maintains the nearby Ghantali Devi temple.",
    latitude: 19.1900934,
    longitude: 72.9716527,
    address: "Sahayog Mandir Path, Ghantali, Naupada, Thane West, Maharashtra 400602",
    city: "Thane",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    established: 1991,
    status: PandalStatus.APPROVED,
  },

  // ──────────────── KALYAN-DOMBIVLI (1) — new city ────────────────
  {
    name: "Diamond Cha Raja (Shree Siddhivinayak Mitra Mandal)",
    description: "Known as the 'navsacha raja' (wish-granting king) of Kalyan-Dombivli — one of the area's most-visited pandals.",
    latitude: 19.2092627,
    longitude: 73.1023624,
    address: "Omkar Nagar, Sagarli Gaon, Dombivli East, Kalyan, Maharashtra 421203",
    city: "Kalyan-Dombivli",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },

  // ──────────────── CHHATRAPATI SAMBHAJINAGAR / AURANGABAD (2) — new city ────────────────
  {
    name: "Raja Lambodar (Shree Bholebhakt Ganesh Mandal)",
    description: "Known simply as 'Sambhaji Nagar Cha Raja' — the city's single biggest Ganeshotsav event.",
    latitude: 19.8846996,
    longitude: 75.3357216,
    address: "Jadhav Mandi, Nawabpura, Chhatrapati Sambhajinagar, Maharashtra 431001",
    city: "Chhatrapati Sambhajinagar",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Vighnaharta Ganesh Mandal",
    description: "A Garkheda-area pandal famous specifically for its dhol-tasha ('vadya') pathak performances.",
    latitude: 19.8545558,
    longitude: 75.3535217,
    address: "12th Scheme, Sara Raaj Nagar, Garkheda, Chhatrapati Sambhajinagar, Maharashtra 431009",
    city: "Chhatrapati Sambhajinagar",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
];

const ACHIEVEMENTS = [
  ...BADGE_DEFINITIONS,
  // Legacy alias keys for backward compatibility
  { key: "first_darshan", name: "First Darshan", description: "Discovered your first Ganpati pandal", icon: "🐘", category: "EXPLORATION", rarity: "COMMON", threshold: 1, points: 10, hidden: true, sortOrder: 99 },
  { key: "pandal_5", name: "Panchami Explorer", description: "Discovered 5 unique pandals", icon: "📍", category: "EXPLORATION", rarity: "COMMON", threshold: 5, points: 25, hidden: true, sortOrder: 99 },
  { key: "pandal_10", name: "Dashami Devotee", description: "Discovered 10 unique pandals", icon: "🔥", category: "EXPLORATION", rarity: "RARE", threshold: 10, points: 50, hidden: true, sortOrder: 99 },
  { key: "pandal_25", name: "Pandal Hunter", description: "Discovered 25 unique pandals", icon: "🗺️", category: "EXPLORATION", rarity: "EPIC", threshold: 25, points: 100, hidden: true, sortOrder: 99 },
  { key: "rare_pandal", name: "Manacha Bhakt", description: "Discovered a rare or historic pandal", icon: "⭐", category: "EXPLORATION", rarity: "LEGENDARY", threshold: 1, points: 50, hidden: true, sortOrder: 99 },
];

// Quests — active for the current festival
const now = new Date();
const festivalEnd = new Date("2026-09-09");

const QUESTS = [
  {
    title: "First Bappa Quest",
    description: "Discover your first Ganpati pandal nearby",
    type: QuestType.DISCOVER_N,
    requirement: 1,
    reward: 20,
    activeFrom: now,
    activeUntil: festivalEnd,
  },
  {
    title: "Panchami Mission",
    description: "Discover 5 unique Ganpati pandals",
    type: QuestType.DISCOVER_N,
    requirement: 5,
    reward: 75,
    activeFrom: now,
    activeUntil: festivalEnd,
  },
  {
    title: "Dashami Challenge",
    description: "Discover 10 unique Ganpati pandals",
    type: QuestType.DISCOVER_N,
    requirement: 10,
    reward: 150,
    activeFrom: now,
    activeUntil: festivalEnd,
  },
  {
    title: "Bappa Lens Debut",
    description: "Submit a photo to Bappa Lens community",
    type: QuestType.PHOTO_SUBMIT,
    requirement: 1,
    reward: 30,
    activeFrom: now,
    activeUntil: festivalEnd,
  },
  {
    title: "Night Darshan",
    description: "Visit a Ganpati pandal after 8 PM",
    type: QuestType.NIGHT_DARSHAN,
    requirement: 1,
    reward: 40,
    activeFrom: now,
    activeUntil: festivalEnd,
  },
  {
    title: "Unknown Bappa Hunter",
    description: "Discover and submit a new pandal not on the map",
    type: QuestType.FIND_UNKNOWN,
    requirement: 1,
    reward: 100,
    activeFrom: now,
    activeUntil: festivalEnd,
  },
];

async function main() {
  console.log("🐘 Seeding BAPPA MODE database...\n");

  // Clear existing data
  await prisma.photoVote.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.userQuest.deleteMany();
  await prisma.squadMember.deleteMany();
  await prisma.squad.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.pandalVisit.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.pandal.deleteMany();
  await prisma.scoreTransaction.deleteMany();
  await prisma.anonymousUser.deleteMany();

  // Seed pandals
  const createdPandals = [];
  for (const pandal of PANDALS) {
    const created = await prisma.pandal.create({ data: pandal });
    createdPandals.push(created);
  }
  console.log(`✅ Created ${PANDALS.length} pandals`);

  // Seed achievements
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.create({ data: achievement });
  }
  console.log(`✅ Created ${ACHIEVEMENTS.length} achievements`);

  // Seed quests
  for (const quest of QUESTS) {
    await prisma.quest.create({ data: quest });
  }
  console.log(`✅ Created ${QUESTS.length} quests`);

  // Create demo leaderboard users
  const demoUsers = [
    { name: "Pandal Hunter", num: 2841, city: "Pune", pandals: 47, score: 1200 },
    { name: "Morya Explorer", num: 921, city: "Mumbai", pandals: 39, score: 980 },
    { name: "Modak Warrior", num: 182, city: "Nashik", pandals: 34, score: 860 },
    { name: "Bappa Bhakt", num: 7721, city: "Pune", pandals: 28, score: 700 },
    { name: "Ganpati Yatri", num: 4401, city: "Mumbai", pandals: 22, score: 550 },
    { name: "Morya Master", num: 3318, city: "Nagpur", pandals: 18, score: 450 },
    { name: "Dhol Tasha Warrior", num: 5512, city: "Pune", pandals: 15, score: 375 },
    { name: "Pandal Pro", num: 9901, city: "Mumbai", pandals: 12, score: 300 },
    { name: "Bappa Nomad", num: 1123, city: "Nashik", pandals: 9, score: 225 },
    { name: "Morya Wanderer", num: 6677, city: "Nagpur", pandals: 7, score: 175 },
  ];

  const createdUsers = [];
  for (const u of demoUsers) {
    const user = await prisma.anonymousUser.create({
      data: {
        deviceId: `demo-${u.num}`,
        sessionToken: `demo-token-${u.num}`,
        generatedName: u.name,
        generatedNumber: u.num,
        city: u.city,
        uniquePandals: u.pandals,
        score: u.score,
      },
    });
    createdUsers.push(user);
  }
  console.log(`✅ Created ${demoUsers.length} demo leaderboard users`);

  // Seed sample photos from public/photos to pandals and Bappa Lens
  const photoFiles = [
    { url: "/photos/bappa-1.jpg", cat: "BEST_BAPPA" as const, likes: 64, isPod: true, feat: true, caption: "Kasba Ganpati Manacha Pahila Darshan" },
    { url: "/photos/bappa-2.jpg", cat: "BEST_DECORATION" as const, likes: 48, isPod: false, feat: true, caption: "Magnificent floral decor and lighting" },
    { url: "/photos/bappa-3.jpg", cat: "BEST_BAPPA" as const, likes: 92, isPod: false, feat: true, caption: "Dagdusheth Halwai Golden Bappa" },
    { url: "/photos/bappa-4.jpg", cat: "NIGHT_DARSHAN" as const, likes: 35, isPod: false, feat: false, caption: "Divine aarti late evening" },
    { url: "/photos/bappa-5.jpg", cat: "BEST_VIBE" as const, likes: 78, isPod: false, feat: true, caption: "Dhol tasha procession fervor" },
    { url: "/photos/bappa-6.jpg", cat: "BEST_SHOT" as const, likes: 29, isPod: false, feat: false, caption: "Peaceful quiet morning darshan" },
    { url: "/photos/bappa-7.jpg", cat: "BEST_BAPPA" as const, likes: 53, isPod: false, feat: false, caption: "Lalbaugcha Raja Darshan" },
    { url: "/photos/bappa-8.jpg", cat: "BEST_DECORATION" as const, likes: 41, isPod: false, feat: false, caption: "Eco-friendly Clay Ganesh idol" },
    { url: "/photos/bappa-9.jpg", cat: "NIGHT_DARSHAN" as const, likes: 62, isPod: false, feat: true, caption: "Illuminated pandal gates" },
    { url: "/photos/bappa-10.jpg", cat: "BEST_SHOT" as const, likes: 88, isPod: false, feat: true, caption: "He is coming soon! Ganpati Bappa Morya" },
    { url: "/photos/bappa-11.jpg", cat: "BEST_BAPPA" as const, likes: 47, isPod: false, feat: false, caption: "Warm blessings from Bappa" },
  ];

  for (let i = 0; i < photoFiles.length; i++) {
    const p = photoFiles[i];
    const targetPandal = createdPandals[i % createdPandals.length];
    const targetUser = createdUsers[i % createdUsers.length];

    await prisma.photo.create({
      data: {
        userId: targetUser.id,
        pandalId: targetPandal.id,
        imageUrl: p.url,
        category: p.cat,
        likeCount: p.likes,
        isPhotoOfDay: p.isPod,
        isFeatured: p.feat,
        caption: p.caption,
        moderationStatus: "APPROVED",
      },
    });
  }
  console.log(`✅ Seeded ${photoFiles.length} curated Bappa photos into pandals & lens feed`);

  console.log("\n🐘 Seed complete! GANPATI BAPPA MORYA!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());