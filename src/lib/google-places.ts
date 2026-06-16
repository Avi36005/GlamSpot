import { prisma } from "./prisma";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const mapsKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyBMEfWFkqWD5DCaDCYTGEFaTZFE84D-d0Q";

export async function syncGoogleSalons(q: string, locality?: string) {
  if (!q && !locality) return;

  // 1. Build search query
  let searchQuery = q ? q.trim() : "";
  if (locality) {
    if (searchQuery) {
      searchQuery = `${searchQuery} salon in ${locality}`;
    } else {
      searchQuery = `beauty salons in ${locality}`;
    }
  } else {
    // If no locality, make sure query references salon
    const qLower = searchQuery.toLowerCase();
    if (
      !qLower.includes("salon") &&
      !qLower.includes("parlour") &&
      !qLower.includes("spa") &&
      !qLower.includes("hair") &&
      !qLower.includes("beauty")
    ) {
      searchQuery = `${searchQuery} salons`;
    }
  }

  // Avoid querying empty search terms or general noise
  if (searchQuery.length < 3) return;

  console.log(`[Google Places] Syncing salons for query: "${searchQuery}"`);

  try {
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      searchQuery
    )}&key=${mapsKey}`;
    const res = await fetch(textSearchUrl);
    if (!res.ok) {
      console.error("Google Places Text Search failed:", res.statusText);
      return;
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      console.log("No results returned from Google Places API.");
      return;
    }

    // Process top 10 results
    const results = data.results.slice(0, 10);
    const placeIds = results.map((r: any) => r.place_id);

    // Find which ones are already in DB
    const existingSalons = await prisma.salon.findMany({
      where: {
        id: { in: placeIds.map((pid: string) => `google-${pid}`) },
      },
      select: { id: true },
    });
    const existingIds = new Set(existingSalons.map((s) => s.id));

    // Filter to only new ones to fetch details for
    const newPlaces = results.filter(
      (r: any) => !existingIds.has(`google-${r.place_id}`)
    );
    console.log(
      `Found ${newPlaces.length} new salons out of ${results.length} results. Fetching details...`
    );

    // Fetch details in parallel for new places (up to 8)
    const newPlacesToFetch = newPlaces.slice(0, 8);
    await Promise.all(
      newPlacesToFetch.map(async (place: any) => {
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${
            place.place_id
          }&fields=name,formatted_address,formatted_phone_number,geometry,rating,user_ratings_total,reviews,photos,website,editorial_summary,address_components&key=${mapsKey}`;
          const detailRes = await fetch(detailsUrl);
          if (!detailRes.ok) return;
          const detailData = await detailRes.json();
          const details = detailData.result;
          if (!details) return;

          // Parse locality and city
          let parsedLocality = "";
          let parsedCity = "";
          if (details.address_components) {
            for (const comp of details.address_components) {
              if (
                comp.types.includes("sublocality") ||
                comp.types.includes("neighborhood")
              ) {
                parsedLocality = comp.long_name;
              }
              if (
                comp.types.includes("locality") ||
                comp.types.includes("administrative_area_level_2")
              ) {
                parsedCity = comp.long_name;
              }
            }
          }

          // Fallback for locality/city
          if (!parsedCity) parsedCity = "Mumbai";
          if (!parsedLocality) {
            const parts = details.formatted_address.split(",");
            if (parts.length > 2) {
              parsedLocality = parts[parts.length - 3].trim();
            } else {
              parsedLocality = parsedCity;
            }
          }

          // Construct cover image and gallery
          let coverImage =
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80"; // fallback
          const galleryList: string[] = [];
          if (details.photos && details.photos.length > 0) {
            coverImage = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${details.photos[0].photo_reference}&key=${mapsKey}`;
            for (const p of details.photos.slice(0, 5)) {
              galleryList.push(
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${p.photo_reference}&key=${mapsKey}`
              );
            }
          }

          // Reviews
          const dbReviews = (details.reviews || []).map((r: any) => ({
            author: r.author_name,
            rating: r.rating,
            comment: r.text || "Wonderful experience and service!",
            verified: true,
            createdAt: new Date(r.time * 1000),
          }));

          // Generate services with realistic prices
          const servicesList = [
            {
              name: "Haircut & Styling",
              category: "hair",
              price: 450,
              dur: 45,
              desc: "Premium haircut, hair wash and styling by senior stylist.",
            },
            {
              name: "Global Hair Coloring",
              category: "hair",
              price: 2500,
              dur: 120,
              desc: "L'Oreal Professional global color or highlights.",
            },
            {
              name: "Facial & Skin Glow",
              category: "skin",
              price: 1500,
              dur: 60,
              desc: "Deep cleansing facial with premium serum for radiant skin.",
            },
            {
              name: "Manicure & Nail Care",
              category: "nails",
              price: 600,
              dur: 30,
              desc: "Classic nail trimming, shaping, cuticle care and polish.",
            },
            {
              name: "Pedicure Spa",
              category: "nails",
              price: 800,
              dur: 45,
              desc: "Relaxing foot soak, scrub, massage and classic pedicure.",
            },
            {
              name: "Deep Tissue Massage",
              category: "spa",
              price: 2000,
              dur: 60,
              desc: "Rejuvenating massage to relieve muscle tension and stress.",
            },
          ];

          // Generate staff with realistic Indian names
          const staffNames = [
            {
              name: "Rahul Sharma",
              spec: "Senior Stylist",
              bio: "Expert in modern hair styling and coloring with 8+ years experience.",
            },
            {
              name: "Priya Patel",
              spec: "Nail Artist & Esthetician",
              bio: "Specializes in creative nail art and premium skin care treatments.",
            },
            {
              name: "Aisha Khan",
              spec: "Bridal Specialist & Makeup",
              bio: "Passionate about creating stunning bridal and event makeovers.",
            },
          ];

          const slug = slugify(
            details.name +
              "-" +
              parsedLocality +
              "-" +
              place.place_id.substring(0, 6)
          );

          await prisma.salon.create({
            data: {
              id: `google-${place.place_id}`,
              name: details.name,
              slug,
              description:
                details.editorial_summary?.overview ||
                "Premium beauty and hair services by certified professionals.",
              locality: parsedLocality,
              address: details.formatted_address,
              city: parsedCity,
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
              coverImage,
              gallery: JSON.stringify(galleryList),
              avgRating: details.rating || 4.0,
              totalReviews: details.user_ratings_total || 0,
              verified: true,
              openTime: 9,
              closeTime: 21,
              homeService: Math.random() > 0.5,
              priceFrom: 450,
              services: {
                create: servicesList.map((s) => ({
                  name: s.name,
                  category: s.category,
                  price: s.price,
                  durationMins: s.dur,
                  description: s.desc,
                })),
              },
              staff: {
                create: staffNames.map((st) => ({
                  name: st.name,
                  specialisation: st.spec,
                  bio: st.bio,
                  avatarUrl: `https://images.unsplash.com/photo-${
                    Math.random() > 0.5
                      ? "1494790108377-be9c29b29330"
                      : "1507003211169-0a1dd7228f2d"
                  }?w=400&q=80`,
                })),
              },
              reviews: {
                create: dbReviews,
              },
            },
          });
          console.log(
            `Successfully synced and saved new salon: ${details.name} in ${parsedLocality}`
          );
        } catch (err) {
          console.error(
            `Error syncing details for place ${place.place_id}:`,
            err
          );
        }
      })
    );
  } catch (err) {
    console.error("Error in syncGoogleSalons:", err);
  }
}
