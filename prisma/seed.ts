import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

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

  // Create demo user
  await prisma.user.create({
    data: {
      id: "demo-user",
      name: "Aanya Kapoor",
      email: "aanya@glamspot.in",
      phone: "+919876543210",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    },
  });

  // Load bulk real salons data
  const realSalonsPath = path.join(process.cwd(), "prisma", "real_salons_bulk.json");
  if (!fs.existsSync(realSalonsPath)) {
    throw new Error("Missing prisma/real_salons_bulk.json file!");
  }
  const realSalons = JSON.parse(fs.readFileSync(realSalonsPath, "utf-8"));
  console.log(`Loaded ${realSalons.length} real salons from Google Places API.`);

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBMEfWFkqWD5DCaDCYTGEFaTZFE84D-d0Q";
  const replaceKeyPlaceholder = (url: string) => url.replace("__MAPS_API_KEY__", mapsKey);

  const SALON_INTERIOR_IMAGES = [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80",
    "https://images.unsplash.com/photo-1600948836101-f9ffda59d151?w=1200&q=80",
    "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=1200&q=80",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=1200&q=80",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&q=80",
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80",
    "https://images.unsplash.com/photo-1596178060810-72cb6f4a8f90?w=1200&q=80",
    "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&q=80",
    "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&q=80",
    "https://images.unsplash.com/photo-1522337660859-02f6f27f31ac?w=1200&q=80"
  ];

  function getSalonInteriorImages(seedStr: string) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    const coverIdx = hash % SALON_INTERIOR_IMAGES.length;
    const coverImage = SALON_INTERIOR_IMAGES[coverIdx];

    const gallery: string[] = [];
    for (let i = 1; i <= 4; i++) {
      const idx = (coverIdx + i) % SALON_INTERIOR_IMAGES.length;
      gallery.push(SALON_INTERIOR_IMAGES[idx]);
    }

    return { coverImage, gallery };
  }

  for (const s of realSalons) {
    const { coverImage, gallery } = getSalonInteriorImages(s.name);
    
    // Map reviews with actual timestamps
    const dbReviews = s.reviews.map((r: any) => ({
      author: r.author,
      rating: r.rating,
      comment: r.comment,
      verified: true,
      createdAt: new Date(r.time * 1000)
    }));

    const salon = await prisma.salon.create({
      data: {
        name: s.name,
        slug: slugify(s.name + "-" + s.locality),
        description: s.description,
        locality: s.locality,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        coverImage: coverImage,
        gallery: JSON.stringify(gallery),
        avgRating: s.rating,
        totalReviews: s.reviews.length,
        verified: s.verified,
        openTime: s.open,
        closeTime: s.close,
        homeService: s.home,
        priceFrom: s.priceFrom,
        phone: s.phone || "",
        services: {
          create: s.services.map((sv: any) => ({
            name: sv.name,
            category: sv.category,
            price: sv.price,
            durationMins: sv.dur,
            description: sv.desc,
          })),
        },
        staff: {
          create: s.staff.map((st: any) => ({
            name: st.name,
            specialisation: st.spec,
            avatarUrl: st.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
            bio: st.bio,
          })),
        },
        reviews: {
          create: dbReviews,
        },
      },
    });
    console.log(`Seeded: ${salon.name} in ${salon.locality} with ${dbReviews.length} real Google reviews.`);
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
