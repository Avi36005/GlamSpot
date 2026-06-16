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

  for (const s of realSalons) {
    const coverImage = s.cover ? replaceKeyPlaceholder(s.cover) : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80";
    const galleryList = s.gallery ? s.gallery.map(replaceKeyPlaceholder) : [];
    
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
        gallery: JSON.stringify(galleryList),
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
