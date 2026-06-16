import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Curated salon / beauty imagery (Unsplash, no key required)
const IMG = {
  hair1: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
  hair2: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80",
  salon1: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1200&q=80",
  salon2: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=80",
  spa1: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80",
  spa2: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
  bridal1: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&q=80",
  bridal2: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=1200&q=80",
  nails1: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=80",
  nails2: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1200&q=80",
  makeup1: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80",
  facial1: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80",
  interior1: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80",
  interior2: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&q=80",
  person1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  person2: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  person3: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  person4: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
  person5: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80",
  man1: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  man2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
};

type SeedSalon = {
  name: string;
  locality: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  cover: string;
  gallery: string[];
  rating: number;
  verified: boolean;
  open: number;
  close: number;
  home: boolean;
  priceFrom: number;
  services: { name: string; category: string; price: number; dur: number; desc: string }[];
  staff: { name: string; spec: string; avatar: string; bio: string }[];
};

const SALONS: SeedSalon[] = [
  {
    name: "Looks Salon",
    locality: "Bandra West",
    address: "Hill Road, Bandra West, Mumbai 400050",
    lat: 19.0596,
    lng: 72.8295,
    description:
      "A Bandra institution known for precision cuts and a warm, unhurried experience. Looks Salon blends classic technique with the latest trends, making it a favourite among the neighbourhood's creative crowd.",
    cover: IMG.salon1,
    gallery: [IMG.hair1, IMG.facial1, IMG.nails1, IMG.interior1],
    rating: 4.6,
    verified: true,
    open: 9,
    close: 21,
    home: false,
    priceFrom: 500,
    services: [
      { name: "Women's Haircut", category: "hair", price: 700, dur: 60, desc: "Consultation, wash, cut and style by a senior stylist." },
      { name: "Hair Spa", category: "spa", price: 1200, dur: 90, desc: "Deep-conditioning treatment to restore shine and strength." },
      { name: "Facial", category: "skin", price: 900, dur: 60, desc: "Customised facial for a clean, glowing complexion." },
      { name: "Manicure", category: "nails", price: 500, dur: 45, desc: "Classic manicure with shaping, cuticle care and polish." },
      { name: "Pedicure", category: "nails", price: 600, dur: 45, desc: "Relaxing pedicure with exfoliation and massage." },
    ],
    staff: [
      { name: "Priya Sharma", spec: "Hair Specialist", avatar: IMG.person1, bio: "12 years crafting cuts that grow out beautifully." },
      { name: "Neha Patil", spec: "Skin & Nails", avatar: IMG.person2, bio: "Loves a flawless French manicure and a calming facial." },
    ],
  },
  {
    name: "Naturals Hair & Beauty",
    locality: "Andheri West",
    address: "Lokhandwala Complex, Andheri West, Mumbai 400053",
    lat: 19.1364,
    lng: 72.8296,
    description:
      "A friendly neighbourhood salon with a strong bridal portfolio and at-home service across the western suburbs. Naturals is where Andheri comes to get wedding-ready.",
    cover: IMG.bridal1,
    gallery: [IMG.bridal2, IMG.makeup1, IMG.hair2, IMG.interior2],
    rating: 4.4,
    verified: true,
    open: 10,
    close: 20,
    home: true,
    priceFrom: 300,
    services: [
      { name: "Men's Haircut", category: "hair", price: 300, dur: 30, desc: "Sharp, modern cuts for men." },
      { name: "Women's Haircut", category: "hair", price: 500, dur: 45, desc: "Tailored cut and blow-dry." },
      { name: "Bridal Makeup", category: "bridal", price: 8000, dur: 180, desc: "Full HD bridal look with draping included." },
      { name: "Saree Draping", category: "bridal", price: 500, dur: 30, desc: "Elegant draping in your chosen style." },
      { name: "Mehendi", category: "bridal", price: 1500, dur: 90, desc: "Intricate bridal and festive henna designs." },
    ],
    staff: [
      { name: "Sunita Rao", spec: "Bridal Specialist", avatar: IMG.person3, bio: "300+ brides and counting across Mumbai." },
      { name: "Kavita Joshi", spec: "Hair Expert", avatar: IMG.person4, bio: "Balayage and blow-dry are her signature." },
    ],
  },
  {
    name: "Jean-Claude Biguine",
    locality: "Juhu",
    address: "Juhu Tara Road, Juhu, Mumbai 400049",
    lat: 19.1075,
    lng: 72.8263,
    description:
      "French luxury hairdressing on Juhu's seafront. Expect impeccable colour work, indulgent spa rituals and a serene, high-end interior.",
    cover: IMG.spa1,
    gallery: [IMG.spa2, IMG.hair1, IMG.facial1, IMG.interior1],
    rating: 4.7,
    verified: true,
    open: 10,
    close: 21,
    home: false,
    priceFrom: 800,
    services: [
      { name: "Luxury Hair Color", category: "hair", price: 3500, dur: 120, desc: "Premium global or fashion colour with bond protection." },
      { name: "Keratin Treatment", category: "hair", price: 4500, dur: 150, desc: "Frizz-free, glossy hair for months." },
      { name: "Deep Tissue Massage", category: "spa", price: 2500, dur: 60, desc: "Therapeutic massage to release deep tension." },
      { name: "Anti-Aging Facial", category: "skin", price: 2000, dur: 75, desc: "Advanced facial targeting fine lines and dullness." },
    ],
    staff: [
      { name: "Marco D'Souza", spec: "Color Specialist", avatar: IMG.man1, bio: "Trained in Paris, obsessed with the perfect blonde." },
      { name: "Anjali Menon", spec: "Spa Therapist", avatar: IMG.person5, bio: "Brings calm and craft to every ritual." },
    ],
  },
  {
    name: "YLG Salon",
    locality: "Powai",
    address: "Hiranandani Gardens, Powai, Mumbai 400076",
    lat: 19.1197,
    lng: 72.9089,
    description:
      "Quick, affordable and reliable everyday beauty in the heart of Powai. YLG is the go-to for threading, waxing and a fuss-free haircut, with home service on demand.",
    cover: IMG.salon2,
    gallery: [IMG.facial1, IMG.nails2, IMG.hair2, IMG.interior2],
    rating: 4.3,
    verified: true,
    open: 9,
    close: 21,
    home: true,
    priceFrom: 200,
    services: [
      { name: "Threading Eyebrows", category: "threading", price: 50, dur: 15, desc: "Precise brow shaping in minutes." },
      { name: "Full Arms Waxing", category: "waxing", price: 300, dur: 30, desc: "Smooth results with gentle wax." },
      { name: "Women's Haircut", category: "hair", price: 400, dur: 45, desc: "Everyday cut and finish." },
      { name: "Cleanup", category: "skin", price: 500, dur: 45, desc: "Refreshing express facial cleanup." },
    ],
    staff: [
      { name: "Rashida Khan", spec: "Threading Expert", avatar: IMG.person2, bio: "The steadiest hands in Powai." },
      { name: "Pooja Nair", spec: "Hair & Skin", avatar: IMG.person1, bio: "Friendly, fast and always on time." },
    ],
  },
  {
    name: "Enrich Salon",
    locality: "Colaba",
    address: "Colaba Causeway, Colaba, Mumbai 400005",
    lat: 18.9067,
    lng: 72.8147,
    description:
      "A polished South Mumbai favourite for colour, nail art and body care. Enrich pairs trained stylists with premium products in a chic Colaba setting.",
    cover: IMG.nails1,
    gallery: [IMG.nails2, IMG.hair1, IMG.spa1, IMG.interior1],
    rating: 4.5,
    verified: true,
    open: 10,
    close: 21,
    home: false,
    priceFrom: 400,
    services: [
      { name: "Global Hair Color", category: "hair", price: 2500, dur: 120, desc: "Even, head-to-tip colour in your chosen shade." },
      { name: "Nail Art", category: "nails", price: 800, dur: 60, desc: "Custom hand-painted nail art." },
      { name: "Body Polishing", category: "spa", price: 3000, dur: 90, desc: "Full-body exfoliation for radiant skin." },
      { name: "Eyelash Extensions", category: "skin", price: 1500, dur: 60, desc: "Natural to dramatic lash sets." },
    ],
    staff: [
      { name: "Tanya Mistry", spec: "Color & Styling", avatar: IMG.person3, bio: "Colour correction is her superpower." },
      { name: "Mehak Ahuja", spec: "Nail Artist", avatar: IMG.person4, bio: "Tiny brushes, big ideas." },
    ],
  },
  {
    name: "Green Trends",
    locality: "Dadar",
    address: "Ranade Road, Dadar West, Mumbai 400028",
    lat: 19.0176,
    lng: 72.8423,
    description:
      "An easy, value-friendly salon in bustling Dadar for quick haircuts, blow-dries and nails. No frills, just dependable service.",
    cover: IMG.hair2,
    gallery: [IMG.hair1, IMG.nails1, IMG.interior2, IMG.facial1],
    rating: 4.2,
    verified: false,
    open: 9,
    close: 20,
    home: false,
    priceFrom: 250,
    services: [
      { name: "Women's Haircut", category: "hair", price: 350, dur: 45, desc: "Clean, reliable cut and style." },
      { name: "Blow Dry", category: "hair", price: 250, dur: 30, desc: "Bouncy, salon-finish blow-dry." },
      { name: "Nail Polish", category: "nails", price: 200, dur: 20, desc: "Classic polish in your favourite shade." },
      { name: "Gel Nails", category: "nails", price: 600, dur: 60, desc: "Long-lasting glossy gel finish." },
    ],
    staff: [
      { name: "Deepika More", spec: "Hair Stylist", avatar: IMG.person5, bio: "Quick, neat and great with curls." },
    ],
  },
  {
    name: "Jawed Habib",
    locality: "Borivali",
    address: "S.V. Road, Borivali West, Mumbai 400092",
    lat: 19.2307,
    lng: 72.8567,
    description:
      "A trusted name for affordable men's and women's hair across Borivali. Great everyday cuts, colour and spa from a familiar brand.",
    cover: IMG.salon2,
    gallery: [IMG.hair1, IMG.hair2, IMG.interior1, IMG.spa2],
    rating: 4.1,
    verified: true,
    open: 9,
    close: 21,
    home: false,
    priceFrom: 150,
    services: [
      { name: "Men's Haircut", category: "hair", price: 150, dur: 20, desc: "Crisp, classic men's cut." },
      { name: "Women's Haircut", category: "hair", price: 300, dur: 30, desc: "Simple cut and finish." },
      { name: "Hair Color Men", category: "hair", price: 500, dur: 60, desc: "Natural-looking grey coverage." },
      { name: "Hair Spa", category: "spa", price: 800, dur: 60, desc: "Nourishing spa for tired hair." },
    ],
    staff: [
      { name: "Rajesh Kumar", spec: "Senior Stylist", avatar: IMG.man1, bio: "20 years behind the chair." },
      { name: "Amit Shah", spec: "Hair Expert", avatar: IMG.man2, bio: "Fades and beard styling on point." },
    ],
  },
  {
    name: "Lakme Salon",
    locality: "Worli",
    address: "Worli Sea Face, Worli, Mumbai 400018",
    lat: 19.0176,
    lng: 72.8156,
    description:
      "The gold standard for bridal and party glam in Mumbai. Lakme Salon Worli is staffed by celebrity-trained artists and is a destination for the city's most important days.",
    cover: IMG.makeup1,
    gallery: [IMG.bridal1, IMG.bridal2, IMG.facial1, IMG.interior1],
    rating: 4.8,
    verified: true,
    open: 9,
    close: 21,
    home: false,
    priceFrom: 600,
    services: [
      { name: "Bridal Makeup", category: "bridal", price: 12000, dur: 240, desc: "Signature airbrush bridal look with trial." },
      { name: "Pre-Bridal Package", category: "bridal", price: 5000, dur: 180, desc: "Multi-session skin and hair prep for the big day." },
      { name: "Party Makeup", category: "bridal", price: 2000, dur: 90, desc: "Camera-ready glam for any occasion." },
      { name: "Facial", category: "skin", price: 1200, dur: 60, desc: "Luxury brightening facial." },
      { name: "Women's Haircut", category: "hair", price: 600, dur: 45, desc: "Stylist cut and blow-dry." },
    ],
    staff: [
      { name: "Divya Kapoor", spec: "Celebrity Makeup Artist", avatar: IMG.person1, bio: "Bridal artist to Mumbai's who's-who." },
      { name: "Ritu Singh", spec: "Skin Specialist", avatar: IMG.person2, bio: "Believes great makeup starts with great skin." },
      { name: "Aisha Fernandes", spec: "Hair Expert", avatar: IMG.person3, bio: "Updos and waves that last all night." },
    ],
  },
];

const REVIEW_AUTHORS = [
  "Ananya R.", "Rohan M.", "Sneha K.", "Karan D.", "Pooja S.", "Aditi V.",
  "Vikram J.", "Megha T.", "Farah Q.", "Nikhil P.", "Sara F.", "Tanvi G.",
];

const POSITIVE = [
  "Absolutely loved my experience. The staff were so warm and the result was perfect.",
  "Clean, professional and on time. My new go-to in Mumbai.",
  "The stylist really listened to what I wanted. Came out exactly as I hoped.",
  "Great ambience and skilled team. Worth every rupee.",
  "Booking was effortless and the service was top-notch.",
  "Felt pampered the whole time. Highly recommend to anyone nearby.",
  "Best haircut I've had in years. So happy I found this place.",
  "Lovely, relaxing experience and gorgeous results.",
];
const MIXED = [
  "Good service overall, but the wait was a little longer than expected.",
  "Lovely results, though it can get crowded on weekends. Book early.",
  "Skilled staff. Slightly on the pricier side but you get what you pay for.",
];

function reviewsFor(rating: number, count: number) {
  const out: { author: string; rating: number; comment: string; daysAgo: number }[] = [];
  for (let i = 0; i < count; i++) {
    const isMixed = rating < 4.5 && i % 4 === 3;
    const r = isMixed ? 4 : rating >= 4.6 ? 5 : i % 3 === 0 ? 4 : 5;
    out.push({
      author: REVIEW_AUTHORS[(i * 3) % REVIEW_AUTHORS.length],
      rating: r,
      comment: isMixed ? MIXED[i % MIXED.length] : POSITIVE[i % POSITIVE.length],
      daysAgo: 2 + i * 5,
    });
  }
  return out;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.savedSalon.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.salon.deleteMany();
  await prisma.user.deleteMany();

  // Demo user (stands in for Firebase-authed user until keys are added)
  await prisma.user.create({
    data: {
      id: "demo-user",
      name: "Aanya Kapoor",
      email: "aanya@glamspot.in",
      phone: "+919876543210",
      avatarUrl: IMG.person1,
    },
  });

  for (const s of SALONS) {
    const reviewCount = s.name === "Looks Salon" ? 10 : 5 + (s.priceFrom % 4);
    const revs = reviewsFor(s.rating, reviewCount);

    const salon = await prisma.salon.create({
      data: {
        name: s.name,
        slug: slugify(s.name + "-" + s.locality),
        description: s.description,
        locality: s.locality,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        coverImage: s.cover,
        gallery: JSON.stringify(s.gallery),
        avgRating: s.rating,
        totalReviews: reviewCount,
        verified: s.verified,
        openTime: s.open,
        closeTime: s.close,
        homeService: s.home,
        priceFrom: s.priceFrom,
        services: {
          create: s.services.map((sv) => ({
            name: sv.name,
            category: sv.category,
            price: sv.price,
            durationMins: sv.dur,
            description: sv.desc,
          })),
        },
        staff: {
          create: s.staff.map((st) => ({
            name: st.name,
            specialisation: st.spec,
            avatarUrl: st.avatar,
            bio: st.bio,
          })),
        },
        reviews: {
          create: revs.map((r) => ({
            author: r.author,
            rating: r.rating,
            comment: r.comment,
            verified: true,
            createdAt: new Date(Date.now() - r.daysAgo * 86400000),
          })),
        },
      },
    });
    console.log(`Seeded ${salon.name} (${salon.locality}) with ${reviewCount} reviews`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
