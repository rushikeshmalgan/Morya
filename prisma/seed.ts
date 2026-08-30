import { PrismaClient, PandalStatus, QuestType } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { BADGE_DEFINITIONS } from "../lib/badge-config";
const rawUrl =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.TURSO_URL;
const rawToken =
  process.env.TURSO_AUTH_TOKEN ||
  process.env.DATABASE_AUTH_TOKEN ||
  process.env.TURSO_TOKEN;

const url = rawUrl?.trim().replace(/^["']|["']$/g, "").trim() || "file:./dev.db";
const authToken = rawToken?.trim().replace(/^["']|["']$/g, "").trim();

const adapter = new PrismaLibSql({
  url,
  ...(authToken ? { authToken } : {}),
});
const prisma = new PrismaClient({ adapter });


const PANDALS = [
  // ──────────────── PUNE (20 pandals) ────────────────
  {
    name: "Kasba Ganpati",
    description: "The Manacha Pahila Manacha Ganpati — the first of the five most honoured Ganpatis in Pune. Established in 1893, this is the city's most revered pandal.",
    latitude: 18.5196,
    longitude: 73.8553,
    address: "Kasba Peth, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["05:30", "12:00", "20:00"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Tambdi Jogeshwari",
    description: "Manacha Dusra — the second most honoured Ganpati in Pune. Famous for its beautiful decorations and large procession.",
    latitude: 18.5155,
    longitude: 73.8530,
    address: "Tambdi Jogeshwari, Budhwar Peth, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:30"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Guruji Talim Ganpati",
    description: "Manacha Tisra — third in the Manacha hierarchy. Known for its grand celebration and devotion.",
    latitude: 18.5162,
    longitude: 73.8568,
    address: "Guruji Talim, Kasba Peth, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["05:45", "12:00", "20:00"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Tulshibaug Ganpati",
    description: "Manacha Chautha — fourth most honoured. Famous for its traditional setting near the historic Tulshibaug.",
    latitude: 18.5137,
    longitude: 73.8561,
    address: "Tulshibaug, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:00", "12:30", "20:00"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Kesariwada Ganpati",
    description: "Manacha Pachva — the fifth most honoured Ganpati of Pune, based at Lokmanya Tilak's historic Kesariwada residence.",
    latitude: 18.5188,
    longitude: 73.8543,
    address: "Kesariwada, Narayan Peth, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:30"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Dagdusheth Halwai Ganpati",
    description: "One of Pune's most famous and beloved Ganpatis. Known for its golden idol and massive footfall during the festival.",
    latitude: 18.5163,
    longitude: 73.8567,
    address: "Budhwar Peth, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["05:00", "08:00", "12:00", "16:00", "20:00"]),
    established: 1893,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shrimant Dagdusheth Halwai Mandal",
    description: "Iconic Ganpati with stunning decorations and all-day darshan open to all.",
    latitude: 18.5159,
    longitude: 73.8570,
    address: "Ganpati Lane, Budhwar Peth, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    established: 1893,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Tambe Ganpati Mandal",
    description: "A vibrant neighbourhood Ganpati in Sadashiv Peth, loved by locals for its traditional atmosphere.",
    latitude: 18.5102,
    longitude: 73.8478,
    address: "Sadashiv Peth, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "19:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Parvati Ganpati",
    description: "Situated near the famous Parvati Hill temple, this Ganpati attracts devotees for its serene setting.",
    latitude: 18.4927,
    longitude: 73.8427,
    address: "Parvati Payatha, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Sinhagad Road Ganesh Mandal",
    description: "A lively pandal on Sinhagad Road, drawing families and young devotees with elaborate decorations.",
    latitude: 18.4852,
    longitude: 73.8240,
    address: "Sinhagad Road, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Deccan Gymkhana Ganesh Mandal",
    description: "A landmark pandal in the heart of Deccan, famous for creative social-message themed decorations.",
    latitude: 18.5204,
    longitude: 73.8402,
    address: "Deccan Gymkhana, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Kothrud Ganesh Utsav Mandal",
    description: "One of the biggest pandals in the Kothrud area, known for its elaborate tableaux and eco-friendly celebrations.",
    latitude: 18.5074,
    longitude: 73.8165,
    address: "Kothrud, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Vishrantwadi Ganesh Mandal",
    description: "Popular north Pune pandal with stunning pandal design and festive processions.",
    latitude: 18.5649,
    longitude: 73.8956,
    address: "Vishrantwadi, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "19:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Hadapsar Ganpati Bappa Seva Mandal",
    description: "Thriving community pandal in Hadapsar, serving prasad and hosting cultural events throughout the 10-day festival.",
    latitude: 18.5011,
    longitude: 73.9309,
    address: "Hadapsar, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Viman Nagar Ganesh Mandal",
    description: "Young and vibrant pandal near the airport colony, famous for its creative Ganesh idol themes.",
    latitude: 18.5644,
    longitude: 73.9141,
    address: "Viman Nagar, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Baner Ganesh Utsav Mandal",
    description: "IT hub Baner's biggest pandal, known for themed decorations inspired by current events and social messages.",
    latitude: 18.5590,
    longitude: 73.7868,
    address: "Baner, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Aundh Ganesh Mandal",
    description: "A festive pandal in the Aundh area, drawing crowds with its eco-friendly idol and cultural programs.",
    latitude: 18.5588,
    longitude: 73.8081,
    address: "Aundh, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Katraj Ganesh Seva Mandal",
    description: "Popular south Pune pandal, easy to find near Katraj Lake, known for Marathi cultural programs.",
    latitude: 18.4528,
    longitude: 73.8658,
    address: "Katraj, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["06:30", "12:00", "19:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Wakad Ganesh Mandal",
    description: "One of Pimpri-Chinchwad's emerging pandals, with a large community base and eco-conscious celebration.",
    latitude: 18.5935,
    longitude: 73.7601,
    address: "Wakad, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Camp Area Ganesh Mandal",
    description: "The cosmopolitan Camp area comes alive with this pandal blending traditional and modern elements.",
    latitude: 18.5192,
    longitude: 73.8810,
    address: "Camp, Pune",
    city: "Pune",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },

  // ──────────────── MUMBAI (15 pandals) ────────────────
  {
    name: "Lalbaugcha Raja",
    description: "Mumbai's most famous Ganpati, known as the 'King of Lalbaug'. Attracts millions of devotees with wait times of 24+ hours. Wish-granting Ganpati.",
    latitude: 18.9956,
    longitude: 72.8342,
    address: "Lalbaug, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["05:00", "08:00", "12:00", "16:00", "20:00"]),
    established: 1934,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "GSB Seva Mandal (King's Circle)",
    description: "The wealthiest Ganpati in India, known for its gold and silver decorations worth crores. A true spectacle of devotion.",
    latitude: 19.0363,
    longitude: 72.8697,
    address: "King's Circle, Matunga, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["05:30", "12:00", "20:30"]),
    established: 1954,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Khetwadi Ganpati",
    description: "A cluster of 12 famous Ganpatis in Khetwadi lanes. Each lane has its own unique Ganesh with stunning themes.",
    latitude: 18.9560,
    longitude: 72.8265,
    address: "Khetwadi, Girgaon, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    established: 1959,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Chinchpokli Cha Chintamani",
    description: "One of Mumbai's most beloved Ganpatis, known for its simplicity and the immense faith of devotees.",
    latitude: 18.9917,
    longitude: 72.8404,
    address: "Chinchpokli, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["05:30", "12:00", "20:00"]),
    established: 1920,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Andhericha Raja",
    description: "Andheri's most famous Ganpati, celebrated with massive crowds and spectacular decorations in the western suburbs.",
    latitude: 19.1197,
    longitude: 72.8464,
    address: "Andheri West, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    established: 1966,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Tejukaya Ganpati",
    description: "Matunga's cherished Ganpati, part of the South Indian community's celebration, known for its spiritual ambiance.",
    latitude: 19.0294,
    longitude: 72.8635,
    address: "Matunga West, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Ganesh Galli Ganpati",
    description: "Famous for its innovative themes and grand entrance, a must-visit in Lalbaug's pandal cluster.",
    latitude: 18.9945,
    longitude: 72.8335,
    address: "Ganesh Galli, Lalbaug, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Mumbaicha Raja (Gamdevi)",
    description: "A well-respected pandal in Gamdevi known for its community spirit and elegant idol.",
    latitude: 18.9658,
    longitude: 72.8100,
    address: "Gamdevi, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Chembur Cha Raja",
    description: "A landmark Ganpati in Chembur, drawing eastern suburb devotees with its grand celebrations.",
    latitude: 19.0526,
    longitude: 72.8997,
    address: "Chembur, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Borivali Cha Raja",
    description: "North Mumbai's pride, a massive pandal in Borivali West known for its artistic decorations.",
    latitude: 19.2290,
    longitude: 72.8567,
    address: "Borivali West, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Charni Road Ganesh Mandal",
    description: "A charming pandal near the seafront, popular with families from the Charni Road and Marine Lines area.",
    latitude: 18.9540,
    longitude: 72.8202,
    address: "Charni Road, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Ghatkopar Cha Raja",
    description: "One of the biggest pandals in the eastern suburbs, known for its elaborate tableaux and community involvement.",
    latitude: 19.0860,
    longitude: 72.9081,
    address: "Ghatkopar East, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Powai Ganesh Mandal",
    description: "A vibrant pandal in Powai serving the IT community and families of Hiranandani Gardens.",
    latitude: 19.1177,
    longitude: 72.9071,
    address: "Powai, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Malad Cha Raja",
    description: "The pride of Malad, with a tradition spanning decades and massive participation from the western suburbs.",
    latitude: 19.1870,
    longitude: 72.8479,
    address: "Malad West, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Vasai Ganpati Mandal",
    description: "A beautiful pandal in the Vasai area, known for its eco-friendly celebration and local cultural performances.",
    latitude: 19.3921,
    longitude: 72.8371,
    address: "Vasai East, Mumbai",
    city: "Mumbai",
    aartiTimes: JSON.stringify(["06:30", "12:00", "19:30"]),
    status: PandalStatus.APPROVED,
  },

  // ──────────────── NASHIK (8 pandals) ────────────────
  {
    name: "Saptashrungi Ganpati Nashik",
    description: "A renowned Ganpati near the holy Saptashrungi temple circuit, drawing pilgrims from across Maharashtra.",
    latitude: 20.0073,
    longitude: 73.7855,
    address: "College Road, Nashik",
    city: "Nashik",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Shalimar Ganesh Mandal Nashik",
    description: "Nashik's most visited pandal, known for elaborate decorations and its prominent location in the city center.",
    latitude: 19.9975,
    longitude: 73.7898,
    address: "Shalimar, Nashik",
    city: "Nashik",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Panchavati Ganpati",
    description: "Situated near the holy Ramkund at Panchavati, this Ganpati carries special religious significance in Nashik.",
    latitude: 20.0033,
    longitude: 73.7739,
    address: "Panchavati, Nashik",
    city: "Nashik",
    aartiTimes: JSON.stringify(["05:30", "12:00", "19:30"]),
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Mahatma Nagar Ganesh Mandal",
    description: "A well-organized pandal in Mahatma Nagar, known for its disciplined entry system and quality prasad distribution.",
    latitude: 19.9960,
    longitude: 73.7720,
    address: "Mahatma Nagar, Nashik",
    city: "Nashik",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Satpur Ganesh Utsav",
    description: "The industrial area of Satpur comes alive during Ganesh Chaturthi with this large community pandal.",
    latitude: 19.9725,
    longitude: 73.7405,
    address: "Satpur, Nashik",
    city: "Nashik",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Cidco Ganesh Mandal",
    description: "A modern pandal in CIDCO Nashik serving the rapidly growing new city area with youthful energy.",
    latitude: 19.9560,
    longitude: 73.8148,
    address: "CIDCO, Nashik",
    city: "Nashik",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Gangapur Road Ganpati",
    description: "Busy pandal on Nashik's main Gangapur Road, attracting crowds with its strategic location and lively dhol-tasha.",
    latitude: 20.0112,
    longitude: 73.7701,
    address: "Gangapur Road, Nashik",
    city: "Nashik",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Nashik Road Ganesh Mandal",
    description: "One of the oldest and most traditional pandals in Nashik, near the railway station area.",
    latitude: 20.0098,
    longitude: 73.8184,
    address: "Nashik Road, Nashik",
    city: "Nashik",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },

  // ──────────────── NAGPUR (7 pandals) ────────────────
  {
    name: "Tekdi Ganesh Mandir",
    description: "The most famous Ganpati in Nagpur, situated on a hill (tekdi), with a stunning view of the city. Extremely popular year-round.",
    latitude: 21.1458,
    longitude: 79.0882,
    address: "Seminary Hills, Nagpur",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["05:30", "12:00", "20:00"]),
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Ganeshpeth Ganpati",
    description: "Located in the historic Ganeshpeth area, this Ganpati is considered the city's cultural heart during the festival.",
    latitude: 21.1440,
    longitude: 79.0862,
    address: "Ganeshpeth, Nagpur",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    established: 1900,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Dharampeth Ganesh Mandal",
    description: "Nagpur's upscale Dharampeth area hosts this elegant pandal with quality cultural programs and generous prasad.",
    latitude: 21.1420,
    longitude: 79.0765,
    address: "Dharampeth, Nagpur",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Sitabuldi Ganpati",
    description: "Central Nagpur's most accessible pandal, near the Sitabuldi Fort, drawing visitors from across the city.",
    latitude: 21.1472,
    longitude: 79.0818,
    address: "Sitabuldi, Nagpur",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Sadar Bazar Ganesh Mandal",
    description: "In the cantonment area of Sadar, this pandal reflects Nagpur's diverse community coming together for Bappa.",
    latitude: 21.1581,
    longitude: 79.0965,
    address: "Sadar, Nagpur",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Mahal Ganesh Mandal Nagpur",
    description: "The historic Mahal area of Nagpur celebrates Ganesh Chaturthi with great fervour at this traditional pandal.",
    latitude: 21.1530,
    longitude: 79.0812,
    address: "Mahal, Nagpur",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Wardha Road Ganesh Utsav",
    description: "A modern community pandal on the important Wardha Road corridor, known for eco-friendly and charitable activities.",
    latitude: 21.1271,
    longitude: 79.0950,
    address: "Wardha Road, Nagpur",
    city: "Nagpur",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },

  // ──────────────── SATARA (8 pandals) ────────────────
  {
    name: "Rajwada Ganpati (Chhatrapati Shahu Mandal)",
    description: "Historic Ganpati situated near the Royal Rajwada Palace of Satara, with a legacy spanning royal Maratha traditions.",
    latitude: 17.6853,
    longitude: 74.0040,
    address: "Rajwada, Satara",
    city: "Satara",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    established: 1905,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Mangalwar Peth Ganpati (Sambhaji Mandal)",
    description: "One of the most famous and crowded pandals in Satara city, known for its grand dhol tasha procession and artistic decoration.",
    latitude: 17.6882,
    longitude: 74.0086,
    address: "Mangalwar Peth, Satara",
    city: "Satara",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:30"]),
    established: 1928,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Char Bhinti Ganesh Mandal (Ajinkyatara)",
    description: "Iconic landmark pandal near the foot of the historic Ajinkyatara Fort and Char Bhinti memorial in Satara.",
    latitude: 17.6789,
    longitude: 73.9982,
    address: "Char Bhinti, Ajinkyatara Road, Satara",
    city: "Satara",
    aartiTimes: JSON.stringify(["07:00", "12:00", "19:30"]),
    established: 1942,
    isRare: true,
    status: PandalStatus.APPROVED,
  },
  {
    name: "Powai Naka Sarvajanik Ganpati Mandal",
    description: "Located at the central transit hub of Satara at Powai Naka, attracting thousands of daily devotees.",
    latitude: 17.6914,
    longitude: 73.9984,
    address: "Powai Naka, Satara",
    city: "Satara",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Godoli Ganesh Utsav Mandal",
    description: "Famous pandal in Godoli area of Satara, renowned for eco-friendly celebrations and beautiful illumination.",
    latitude: 17.7025,
    longitude: 74.0201,
    address: "Godoli Naka, Satara",
    city: "Satara",
    aartiTimes: JSON.stringify(["07:00", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Karanje Peth Ganpati Mandal",
    description: "Devotee-favourite pandal in historic Karanje Peth, famous for traditional Maharashtrian rituals and aarti.",
    latitude: 17.6765,
    longitude: 74.0123,
    address: "Karanje Peth, Satara",
    city: "Satara",
    aartiTimes: JSON.stringify(["06:30", "12:00", "20:00"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Sadashiv Peth Ganpati Satara",
    description: "Vibrant community pandal in Sadashiv Peth Satara, known for charitable work and prasad distribution.",
    latitude: 17.6895,
    longitude: 74.0012,
    address: "Sadashiv Peth, Satara",
    city: "Satara",
    aartiTimes: JSON.stringify(["07:00", "12:00", "19:30"]),
    status: PandalStatus.APPROVED,
  },
  {
    name: "Moti Chowk Ganpati Mandal",
    description: "Historic market square pandal in Moti Chowk with grand traditional lamps and decorations.",
    latitude: 17.6861,
    longitude: 74.0062,
    address: "Moti Chowk, Satara",
    city: "Satara",
    aartiTimes: JSON.stringify(["06:00", "12:00", "20:00"]),
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
