import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.DATABASE_URL?.includes("supabase") ? { rejectUnauthorized: false } : undefined,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("123456", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@buildflow.com" },
    update: {},
    create: {
      email: "admin@buildflow.com",
      passwordHash: hash,
      name: "Admin User",
      role: "ADMIN",
      isActive: true,
    },
  });

  const vendor = await prisma.vendor.upsert({
    where: { code: "V001" },
    update: {},
    create: {
      name: "ABC Construction Ltd",
      code: "V001",
      type: "contractor",
      contactPerson: "John Doe",
      email: "john@abc.com",
      phone: "+1234567890",
    },
  });

  const project = await prisma.project.upsert({
    where: { code: "PRJ-001" },
    update: {},
    create: {
      name: "Highway Bridge Project",
      code: "PRJ-001",
      description: "Construction of highway bridge",
      location: "Downtown",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2025-12-31"),
      budget: 5000000,
      status: "active",
    },
  });

  // Ensure admin is linked to the demo project
  await prisma.projectUser.upsert({
    where: { userId_projectId: { userId: admin.id, projectId: project.id } },
    update: {},
    create: {
      userId: admin.id,
      projectId: project.id,
      role: "manager",
    },
  });

  // Create a few demo milestones for dashboard progress
  const milestoneDates = ["2024-03-01", "2024-06-01", "2024-09-01", "2024-12-01"];
  for (let i = 0; i < milestoneDates.length; i++) {
    await prisma.milestone.upsert({
      where: {
        // synthetic unique constraint approximation by id; rely on create if not existing
        id: `seed-milestone-${i + 1}`,
      },
      update: {},
      create: {
        id: `seed-milestone-${i + 1}`,
        projectId: project.id,
        name: `Milestone ${i + 1}`,
        description: `Key project milestone ${i + 1}`,
        dueDate: new Date(milestoneDates[i]),
        percentage: (i + 1) * 25,
        status: i < 2 ? "completed" : "pending",
      },
    });
  }

  // Create a couple of demo daily site reports over the last week
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    await prisma.dailyReport.create({
      data: {
        projectId: project.id,
        createdById: admin.id,
        reportDate: d,
        weather: i % 2 === 0 ? "Sunny" : "Cloudy",
        workDone: `General site progress and structural work for day ${i + 1}.`,
        manpower: 25 + i * 3,
        equipment: "Excavators, cranes, trucks",
        issues: i === 2 ? "Minor delay due to rain." : null,
        remarks: "Work progressing as per schedule.",
      },
    });
  }

  // Demo RA bill and payment so billing views look populated
  const bill = await prisma.rABill.create({
    data: {
      projectId: project.id,
      contractId: (await prisma.contract.findFirstOrThrow({ where: { projectId: project.id } })).id,
      billNo: "RA-0001",
      periodFrom: new Date("2024-01-01"),
      periodTo: new Date("2024-01-31"),
      totalAmount: 150000,
      status: "SUBMITTED",
    },
  });

  await prisma.payment.create({
    data: {
      raBillId: bill.id,
      amount: 75000,
      paymentDate: new Date("2024-02-15"),
      referenceNo: "PAY-0001",
      status: "PENDING",
      notes: "Part payment against RA-0001",
    },
  });

  await prisma.contract.upsert({
    where: { contractNo: "CON-001" },
    update: {},
    create: {
      projectId: project.id,
      vendorId: vendor.id,
      contractNo: "CON-001",
      title: "Main Construction Contract",
      value: 3000000,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2025-06-30"),
      status: "active",
    },
  });

  await prisma.notification.create({
    data: {
      userId: admin.id,
      type: "INFO",
      title: "Welcome",
      message: "Your BuildFlow Construction Contract Management system is ready.",
    },
  });

  console.log("Seed completed:", { admin: admin.email, project: project.code });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
