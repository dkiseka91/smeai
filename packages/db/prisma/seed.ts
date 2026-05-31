import { PrismaClient, PlanTier, WorkspaceMemberRole, BusinessStage } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin1234!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aelevate.co.ug' },
    update: {},
    create: {
      email: 'admin@aelevate.co.ug',
      passwordHash,
      name: 'AElevate Admin',
      planTier: PlanTier.INSTITUTION,
      isEmailVerified: true,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: 'seed-workspace-001' },
    update: {},
    create: {
      id: 'seed-workspace-001',
      name: 'AElevate Demo Workspace',
      planTier: PlanTier.INSTITUTION,
      ownerId: admin.id,
    },
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: admin.id } },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: admin.id,
      role: WorkspaceMemberRole.OWNER,
    },
  });

  await prisma.businessProfile.upsert({
    where: { id: 'seed-profile-001' },
    update: {},
    create: {
      id: 'seed-profile-001',
      workspaceId: workspace.id,
      name: 'AgriTech Uganda Demo',
      industry: 'Agriculture Technology',
      industryTemplate: 'agritech',
      stage: BusinessStage.EARLY,
      country: 'UG',
      currency: 'USD',
      isComplete: true,
      onboardingData: {
        businessName: 'AgriTech Uganda Demo',
        industry: 'Agriculture Technology',
        industryTemplate: 'agritech',
        stage: 'EARLY',
        country: 'UG',
        currency: 'USD',
        problemSolved: 'Smallholder farmers lack access to market price data and agricultural inputs',
        targetCustomer: 'Smallholder farmers in Uganda and East Africa',
        productsServices: [
          { name: 'Mobile App Subscription', description: 'Market prices and weather data', price: 5, unit: 'month' },
        ],
        revenueModel: 'SaaS subscription + commission on input purchases',
        teamSize: 4,
        founders: [{ name: 'Jane Nakato', role: 'CEO', background: '10 years agribusiness experience' }],
        fundingAmountNeeded: 150000,
        fundingPurpose: 'Product development and market expansion to 3 new districts',
        fundingType: 'EQUITY',
        location: 'Kampala, Uganda',
      },
    },
  });

  console.log('Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
