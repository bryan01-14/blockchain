import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}
const connectionString = String(uri);

async function seed() {
  const client = new MongoClient(connectionString);
  try {
    await client.connect();
    const db = client.db("culturechain");
    console.log("Connected to MongoDB");

    const usersCol = db.collection("users");

    // Create guide user accounts (matching existing guides)
    const guidePass = await hash("guide123", 10);

    const guideUsers = [
      {
        name: "Koffi Jean-Baptiste",
        email: "koffi.jb@mail.ci",
        password: guidePass,
        role: "guide",
        guideId: "guide-001",
        speciality: "Histoire coloniale",
        sites: ["grand-bassam"],
        certified: true,
        createdAt: new Date(),
      },
      {
        name: "Diallo Aminata",
        email: "aminata.d@mail.ci",
        password: guidePass,
        role: "guide",
        guideId: "guide-002",
        speciality: "Architecture religieuse",
        sites: ["basilique"],
        certified: true,
        createdAt: new Date(),
      },
      {
        name: "Ouattara Moussa",
        email: "moussa.o@mail.ci",
        password: guidePass,
        role: "guide",
        guideId: "guide-003",
        speciality: "Ecotourisme",
        sites: ["parc-tai", "parc-comoe"],
        certified: false,
        createdAt: new Date(),
      },
      {
        name: "Yao Akissi",
        email: "akissi.y@mail.ci",
        password: guidePass,
        role: "guide",
        guideId: "guide-004",
        speciality: "Culture et traditions",
        sites: ["mosquee-kong"],
        certified: false,
        createdAt: new Date(),
      },
    ];

    for (const guide of guideUsers) {
      const existing = await usersCol.findOne({ email: guide.email });
      if (existing) {
        await usersCol.updateOne(
          { email: guide.email },
          { $set: { ...guide } }
        );
        console.log(`Updated guide user: ${guide.name}`);
      } else {
        await usersCol.insertOne(guide);
        console.log(`Created guide user: ${guide.name}`);
      }
    }

    // Seed some sample bookings for guides
    const bookingsCol = db.collection("tour_bookings");
    const existingBookings = await bookingsCol.countDocuments();
    if (existingBookings === 0) {
      await bookingsCol.insertMany([
        {
          bookingId: "book-demo-001",
          tourId: "tour-001",
          tourTitle: "Visite Historique Coloniale",
          siteName: "Grand-Bassam",
          guide: "Koffi Jean-Baptiste",
          guideEmail: "koffi.jb@mail.ci",
          participantEmail: "touriste@mail.ci",
          participantName: "Kouame Aya",
          date: "2026-03-15",
          time: "09:00",
          price: 15000,
          status: "confirmed",
          createdAt: new Date("2026-02-25"),
        },
        {
          bookingId: "book-demo-002",
          tourId: "tour-001",
          tourTitle: "Visite Historique Coloniale",
          siteName: "Grand-Bassam",
          guide: "Koffi Jean-Baptiste",
          guideEmail: "koffi.jb@mail.ci",
          participantEmail: "alice@mail.ci",
          participantName: "Alice Bamba",
          date: "2026-03-15",
          time: "09:00",
          price: 15000,
          status: "confirmed",
          createdAt: new Date("2026-02-26"),
        },
        {
          bookingId: "book-demo-003",
          tourId: "tour-002",
          tourTitle: "Safari Ecotouristique",
          siteName: "Parc National de Tai",
          guide: "Ouattara Moussa",
          guideEmail: "moussa.o@mail.ci",
          participantEmail: "touriste@mail.ci",
          participantName: "Kouame Aya",
          date: "2026-03-20",
          time: "07:00",
          price: 35000,
          status: "pending",
          createdAt: new Date("2026-02-27"),
        },
        {
          bookingId: "book-demo-004",
          tourId: "tour-003",
          tourTitle: "Decouverte Architecturale",
          siteName: "Basilique Notre-Dame de la Paix",
          guide: "Diallo Aminata",
          guideEmail: "aminata.d@mail.ci",
          participantEmail: "jean@mail.ci",
          participantName: "Jean Kouadio",
          date: "2026-03-16",
          time: "14:00",
          price: 20000,
          status: "confirmed",
          createdAt: new Date("2026-02-24"),
        },
        {
          bookingId: "book-demo-005",
          tourId: "tour-003",
          tourTitle: "Decouverte Architecturale",
          siteName: "Basilique Notre-Dame de la Paix",
          guide: "Diallo Aminata",
          guideEmail: "aminata.d@mail.ci",
          participantEmail: "marie@mail.ci",
          participantName: "Marie Traore",
          date: "2026-03-16",
          time: "14:00",
          price: 20000,
          status: "completed",
          createdAt: new Date("2026-02-20"),
        },
        {
          bookingId: "book-demo-006",
          tourId: "tour-001",
          tourTitle: "Visite Historique Coloniale",
          siteName: "Grand-Bassam",
          guide: "Koffi Jean-Baptiste",
          guideEmail: "koffi.jb@mail.ci",
          participantEmail: "marc@mail.ci",
          participantName: "Marc Toure",
          date: "2026-03-10",
          time: "09:00",
          price: 15000,
          status: "completed",
          createdAt: new Date("2026-02-18"),
        },
      ]);
      console.log("Sample bookings seeded");
    }

    // Seed craft orders for guides
    const craftOrdersCol = db.collection("craft_orders");
    const existingOrders = await craftOrdersCol.countDocuments();
    if (existingOrders === 0) {
      await craftOrdersCol.insertMany([
        {
          orderId: "order-001",
          craftName: "Masque Baoule Sacre",
          craftId: "craft-001",
          buyerEmail: "touriste@mail.ci",
          buyerName: "Kouame Aya",
          sellerGuide: "Koffi Jean-Baptiste",
          sellerEmail: "koffi.jb@mail.ci",
          price: 45000,
          status: "confirmed",
          nftToken: "0x7f3a...nft01",
          createdAt: new Date("2026-02-26"),
        },
        {
          orderId: "order-002",
          craftName: "Tissu Kente Senoufo",
          craftId: "craft-002",
          buyerEmail: "alice@mail.ci",
          buyerName: "Alice Bamba",
          sellerGuide: "Diallo Aminata",
          sellerEmail: "aminata.d@mail.ci",
          price: 35000,
          status: "confirmed",
          nftToken: "0x9d4e...nft02",
          createdAt: new Date("2026-02-25"),
        },
        {
          orderId: "order-003",
          craftName: "Poterie Bete Traditionnelle",
          craftId: "craft-003",
          buyerEmail: "jean@mail.ci",
          buyerName: "Jean Kouadio",
          sellerGuide: "Koffi Jean-Baptiste",
          sellerEmail: "koffi.jb@mail.ci",
          price: 28000,
          status: "pending",
          nftToken: null,
          createdAt: new Date("2026-02-28"),
        },
        {
          orderId: "order-004",
          craftName: "Bijoux Akan en Or",
          craftId: "craft-005",
          buyerEmail: "marie@mail.ci",
          buyerName: "Marie Traore",
          sellerGuide: "Yao Akissi",
          sellerEmail: "akissi.y@mail.ci",
          price: 65000,
          status: "completed",
          nftToken: "0x2c8f...nft04",
          createdAt: new Date("2026-02-15"),
        },
      ]);
      console.log("Craft orders seeded");
    }

    console.log("Guide users and data seed complete!");
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
