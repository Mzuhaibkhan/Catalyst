import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const candidatesPath = path.join(__dirname, '../../candidates.json');
  const candidatesData = JSON.parse(fs.readFileSync(candidatesPath, 'utf-8'));

  for (const c of candidatesData.candidates) {
    const candidate = await prisma.candidate.upsert({
      where: { id: c.member.id },
      update: {},
      create: {
        id: c.member.id,
        name: c.member.name,
        jobRole: c.member.jobRole,
        yearsExperience: c.member.yearsExperience,
        education: c.member.education,
        status: c.member.status,
        signals: {
          create: {
            commitDays: c.signals.commitDays,
            missionsCompleted: c.signals.missionsCompleted,
            missionsFirstTry: c.signals.missionsFirstTry,
          }
        },
        missions: {
          create: c.missions.map((m: any) => ({
            day: m.day,
            title: m.title,
            passed: m.passed,
            attempts: m.attempts,
            skipped: m.skipped,
          }))
        }
      }
    });
    console.log(`Created candidate: ${candidate.name}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
