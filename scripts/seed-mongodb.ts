import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("culturechain");
    console.log("Connected to MongoDB");

    // --- USERS ---
    const usersCol = db.collection("users");
    await usersCol.deleteMany({});
    const adminPass = await hash("admin123", 10);
    const touristPass = await hash("touriste123", 10);
    await usersCol.insertMany([
      {
        name: "Admin VisitSecure",
        email: "admin@visitsecure.ci",
        password: adminPass,
        role: "admin",
        createdAt: new Date(),
      },
      {
        name: "Kouame Aya",
        email: "touriste@mail.ci",
        password: touristPass,
        role: "tourist",
        createdAt: new Date(),
      },
    ]);
    await usersCol.createIndex({ email: 1 }, { unique: true });
    console.log("Users seeded");

    // --- SITES ---
    const sitesCol = db.collection("sites");
    await sitesCol.deleteMany({});
    await sitesCol.insertMany([
      {
        siteId: "grand-bassam",
        name: "Grand-Bassam",
        description:
          "Ancienne capitale coloniale, classee au patrimoine mondial de l'UNESCO. Ville historique avec une architecture coloniale remarquable et des plages magnifiques le long de l'ocean Atlantique.",
        location: "Grand-Bassam, Region du Sud-Comoe",
        category: "patrimoine",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Grand_Bassam%2C_Ivory_Coast.jpg",
        price: 5000,
        rating: 4.8,
        visitors: 45230,
        unesco: true,
        coordinates: { lat: 5.2, lng: -3.74 },
        published: true,
      },
      {
        siteId: "basilique",
        name: "Basilique Notre-Dame de la Paix",
        description:
          "Plus grande basilique du monde, inscrite au Guinness. Chef-d'oeuvre architectural inspire de la basilique Saint-Pierre de Rome, situee au coeur de Yamoussoukro.",
        location: "Yamoussoukro",
        category: "religieux",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Basilique_notre_Dame_de_la_Paix_de_Yamoussoukro_4.jpg",
        price: 8000,
        rating: 4.9,
        visitors: 78450,
        unesco: false,
        coordinates: { lat: 6.81, lng: -5.28 },
        published: true,
      },
      {
        siteId: "parc-tai",
        name: "Parc National de Tai",
        description:
          "L'une des dernieres forets tropicales primaires d'Afrique de l'Ouest. Patrimoine mondial de l'UNESCO, abritant une biodiversite exceptionnelle dont des chimpanzes.",
        location: "Region du Bas-Sassandra",
        category: "nature",
        image: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Ta%C3%AF_National_Park_%2824148248710%29.jpg",
        price: 15000,
        rating: 4.7,
        visitors: 12340,
        unesco: true,
        coordinates: { lat: 5.75, lng: -7.15 },
        published: true,
      },
      {
        siteId: "mosquee-kong",
        name: "Mosquee de Kong",
        description:
          "Mosquee historique de style soudanais datant du XVIIe siecle. Temoin de l'histoire islamique en Afrique de l'Ouest avec son architecture en terre unique.",
        location: "Kong, Region du Zanzan",
        category: "historique",
        image: "https://discover-ivorycoast.com/wp-content/uploads/2019/01/Mosqu%C3%A9e-de-Kong2-1024x624.jpg",
        price: 3000,
        rating: 4.5,
        visitors: 8920,
        unesco: false,
        coordinates: { lat: 9.15, lng: -4.61 },
        published: true,
      },
      {
        siteId: "parc-comoe",
        name: "Parc National de la Comoe",
        description:
          "Le plus grand parc national d'Afrique de l'Ouest. Zone protegee UNESCO abritant elephants, hippopotames et une flore diversifiee dans une savane immense.",
        location: "Region du Bounkani",
        category: "nature",
        image: "https://upload.wikimedia.org/wikipedia/commons/0/03/Comoe_National_Park_banner.jpg",
        price: 12000,
        rating: 4.6,
        visitors: 15670,
        unesco: true,
        coordinates: { lat: 9.2, lng: -3.8 },
        published: true,
      },
    ]);
    await sitesCol.createIndex({ siteId: 1 }, { unique: true });
    console.log("Sites seeded");

    // --- TICKETS ---
    const ticketsCol = db.collection("tickets");
    await ticketsCol.deleteMany({});
    await ticketsCol.insertMany([
      {
        ticketId: "tkt-001",
        siteId: "grand-bassam",
        siteName: "Grand-Bassam",
        ownerEmail: "touriste@mail.ci",
        ownerName: "Kouame Aya",
        purchaseDate: "2026-02-15",
        visitDate: "2026-03-01",
        tokenId: "0x7f3a...8b2c",
        merkleRoot: "0xabc123...def456",
        verified: true,
        qrCode: "QR-GB-001-2026",
        status: "valid",
      },
      {
        ticketId: "tkt-002",
        siteId: "basilique",
        siteName: "Basilique Notre-Dame de la Paix",
        ownerEmail: "touriste@mail.ci",
        ownerName: "Kouame Aya",
        purchaseDate: "2026-02-10",
        visitDate: "2026-02-20",
        tokenId: "0x9d4e...1a5f",
        merkleRoot: "0xdef789...abc012",
        verified: true,
        qrCode: "QR-BN-002-2026",
        status: "used",
      },
      {
        ticketId: "tkt-003",
        siteId: "parc-tai",
        siteName: "Parc National de Tai",
        ownerEmail: "touriste@mail.ci",
        ownerName: "Kouame Aya",
        purchaseDate: "2026-01-20",
        visitDate: "2026-02-15",
        tokenId: "0x2c8f...6d3a",
        merkleRoot: "0x789abc...012def",
        verified: true,
        qrCode: "QR-PT-003-2026",
        status: "expired",
      },
    ]);
    await ticketsCol.createIndex({ ownerEmail: 1 });
    await ticketsCol.createIndex({ qrCode: 1 }, { unique: true });
    console.log("Tickets seeded");

    // --- TRANSACTIONS ---
    const txCol = db.collection("transactions");
    await txCol.deleteMany({});
    await txCol.insertMany([
      {
        txId: "tx-001",
        type: "ticket_purchase",
        amount: 5000,
        from: "0x1234...5678",
        to: "0xabcd...ef01",
        hash: "0xa1b2c3d4e5f6...789012345678",
        timestamp: "2026-02-27T10:30:00Z",
        blockNumber: 45892301,
        status: "confirmed",
      },
      {
        txId: "tx-002",
        type: "nft_mint",
        amount: 8000,
        from: "0x2345...6789",
        to: "0xbcde...f012",
        hash: "0xb2c3d4e5f6a7...890123456789",
        timestamp: "2026-02-27T09:15:00Z",
        blockNumber: 45892287,
        status: "confirmed",
      },
      {
        txId: "tx-003",
        type: "guide_payment",
        amount: 25000,
        from: "0x3456...7890",
        to: "0xcdef...0123",
        hash: "0xc3d4e5f6a7b8...901234567890",
        timestamp: "2026-02-26T14:45:00Z",
        blockNumber: 45891102,
        status: "confirmed",
      },
      {
        txId: "tx-004",
        type: "ticket_purchase",
        amount: 15000,
        from: "0x4567...8901",
        to: "0xdef0...1234",
        hash: "0xd4e5f6a7b8c9...012345678901",
        timestamp: "2026-02-26T11:20:00Z",
        blockNumber: 45890998,
        status: "pending",
      },
    ]);
    console.log("Transactions seeded");

    // --- GUIDES ---
    const guidesCol = db.collection("guides");
    await guidesCol.deleteMany({});
    await guidesCol.insertMany([
      {
        guideId: "guide-001",
        name: "Koffi Jean-Baptiste",
        email: "koffi.jb@mail.ci",
        speciality: "Histoire coloniale",
        sites: ["grand-bassam"],
        certified: true,
        rating: 4.9,
        totalTours: 234,
        status: "approved",
      },
      {
        guideId: "guide-002",
        name: "Diallo Aminata",
        email: "aminata.d@mail.ci",
        speciality: "Architecture religieuse",
        sites: ["basilique"],
        certified: true,
        rating: 4.8,
        totalTours: 189,
        status: "approved",
      },
      {
        guideId: "guide-003",
        name: "Ouattara Moussa",
        email: "moussa.o@mail.ci",
        speciality: "Ecotourisme",
        sites: ["parc-tai", "parc-comoe"],
        certified: false,
        rating: 4.2,
        totalTours: 45,
        status: "pending",
      },
      {
        guideId: "guide-004",
        name: "Yao Akissi",
        email: "akissi.y@mail.ci",
        speciality: "Culture et traditions",
        sites: ["mosquee-kong"],
        certified: false,
        rating: 3.9,
        totalTours: 12,
        status: "pending",
      },
    ]);
    console.log("Guides seeded");

    // --- STATS ---
    const statsCol = db.collection("stats");
    await statsCol.deleteMany({});
    await statsCol.insertOne({
      key: "dashboard",
      totalVisitors: 160610,
      totalRevenue: 2450000,
      totalTicketsSold: 8934,
      activeGuides: 47,
      sitesCount: 5,
      fraudsPrevented: 342,
      monthlyGrowth: 12.5,
      satisfactionRate: 94.2,
      monthlyData: [
        { month: "Sep", visitors: 8200, revenue: 180000 },
        { month: "Oct", visitors: 9800, revenue: 220000 },
        { month: "Nov", visitors: 11200, revenue: 260000 },
        { month: "Dec", visitors: 14500, revenue: 340000 },
        { month: "Jan", visitors: 12800, revenue: 290000 },
        { month: "Fev", visitors: 13400, revenue: 310000 },
      ],
    });
    console.log("Stats seeded");

    console.log("Seed complete!");
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
