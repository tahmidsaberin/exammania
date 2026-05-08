import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding…");

  const science = await prisma.division.upsert({ where: { slug: "science" }, update: {}, create: { slug: "science", name: "Science", namebn: "বিজ্ঞান" } });
  const commerce = await prisma.division.upsert({ where: { slug: "commerce" }, update: {}, create: { slug: "commerce", name: "Commerce", namebn: "বাণিজ্য" } });
  await prisma.division.upsert({ where: { slug: "arts" }, update: {}, create: { slug: "arts", name: "Arts", namebn: "মানবিক" } });

  // Common subjects
  await prisma.subject.upsert({ where: { slug: "english" }, update: {}, create: { slug: "english", name: "English", namebn: "ইংরেজি", isCommon: true } });
  await prisma.subject.upsert({ where: { slug: "bangla" }, update: {}, create: { slug: "bangla", name: "Bangla", namebn: "বাংলা", isCommon: true } });
  await prisma.subject.upsert({ where: { slug: "ict" }, update: {}, create: { slug: "ict", name: "ICT", namebn: "তথ্য ও যোগাযোগ প্রযুক্তি", isCommon: true } });

  // Science subjects
  const physics = await prisma.subject.upsert({ where: { slug: "physics" }, update: {}, create: { slug: "physics", name: "Physics", namebn: "পদার্থবিজ্ঞান", divisionId: science.id } });
  await prisma.subject.upsert({ where: { slug: "chemistry" }, update: {}, create: { slug: "chemistry", name: "Chemistry", namebn: "রসায়ন", divisionId: science.id } });
  await prisma.subject.upsert({ where: { slug: "biology" }, update: {}, create: { slug: "biology", name: "Biology", namebn: "জীববিজ্ঞান", divisionId: science.id } });

  // Commerce subjects
  await prisma.subject.upsert({ where: { slug: "accounting" }, update: {}, create: { slug: "accounting", name: "Accounting", namebn: "হিসাববিজ্ঞান", divisionId: commerce.id } });
  await prisma.subject.upsert({ where: { slug: "business-studies" }, update: {}, create: { slug: "business-studies", name: "Business Studies", namebn: "ব্যবসায় শিক্ষা", divisionId: commerce.id } });

  // Sample exam
  const exam = await prisma.exam.upsert({
    where: { slug: "physics-chapter-1-mcq" }, update: {},
    create: { title: "Physics Chapter 1 MCQ", titlebn: "পদার্থবিজ্ঞান অধ্যায় ১", slug: "physics-chapter-1-mcq", divisionId: science.id, subjectId: physics.id, timeLimitMin: 30, randomize: true, published: true },
  });

  const questions = [
    { order: 1, type: "MCQ" as const, text: "What is the SI unit of force?", options: ["Newton", "Joule", "Watt", "Pascal"], correct: "0", marks: 1 },
    { order: 2, type: "MCQ" as const, text: "Which law states F = ma?", options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravitation"], correct: "1", marks: 1 },
    { order: 3, type: "TRUE_FALSE" as const, text: "Mass and weight are the same physical quantity.", options: ["True", "False"], correct: "1", marks: 1 },
    { order: 4, type: "MCQ" as const, text: "What is the acceleration due to gravity on Earth?", options: ["8.9 m/s²", "9.8 m/s²", "10.8 m/s²", "11.2 m/s²"], correct: "1", marks: 2 },
    { order: 5, type: "SHORT_ANSWER" as const, text: "State Newton's First Law of Motion.", options: undefined, correct: "An object at rest stays at rest", marks: 3 },
  ];

  for (const q of questions) {
    const id = `seed-${exam.id}-${q.order}`;
    await prisma.question.upsert({ where: { id }, update: {}, create: { id, examId: exam.id, ...q } });
  }

  console.log("✅ Seed complete");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
