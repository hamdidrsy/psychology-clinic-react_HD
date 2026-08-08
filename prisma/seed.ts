import { config as loadEnv } from "dotenv";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Seed için DATABASE_URL zorunludur.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const developmentServices = [
  {
    slug: "ornek-bireysel-gorusme",
    name: "Örnek Bireysel Görüşme",
    shortDescription:
      "Yalnız geliştirme ortamında kullanılan sahte hizmet kaydı.",
    displayOrder: 10,
  },
  {
    slug: "ornek-online-gorusme",
    name: "Örnek Online Görüşme",
    shortDescription: "Gerçek klinik hizmeti veya uzmanlık iddiası değildir.",
    displayOrder: 20,
  },
] as const;

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Geliştirme seed'i production ortamında çalıştırılamaz.");
  }

  for (const service of developmentServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: { ...service, isPublished: false },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
