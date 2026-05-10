import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding…");

  const sscScience = await prisma.division.upsert({
    where: { slug: "ssc-science" },
    update: {},
    create: { slug: "ssc-science", name: "Science", namebn: "বিজ্ঞান", level: "SSC" },
  });
  const sscCommerce = await prisma.division.upsert({
    where: { slug: "ssc-commerce" },
    update: {},
    create: { slug: "ssc-commerce", name: "Commerce", namebn: "বাণিজ্য", level: "SSC" },
  });
  const sscArts = await prisma.division.upsert({
    where: { slug: "ssc-arts" },
    update: {},
    create: { slug: "ssc-arts", name: "Arts", namebn: "মানবিক", level: "SSC" },
  });

  const hscScience = await prisma.division.upsert({
    where: { slug: "hsc-science" },
    update: {},
    create: { slug: "hsc-science", name: "Science", namebn: "বিজ্ঞান", level: "HSC" },
  });
  const hscCommerce = await prisma.division.upsert({
    where: { slug: "hsc-commerce" },
    update: {},
    create: { slug: "hsc-commerce", name: "Commerce", namebn: "বাণিজ্য", level: "HSC" },
  });
  const hscArts = await prisma.division.upsert({
    where: { slug: "hsc-arts" },
    update: {},
    create: { slug: "hsc-arts", name: "Arts", namebn: "মানবিক", level: "HSC" },
  });

  // SSC common subjects
  await prisma.subject.upsert({
    where: { slug: "bangla-ssc" },
    update: {},
    create: { slug: "bangla-ssc", name: "Bangla", namebn: "বাংলা", isCommon: true, level: "SSC" },
  });
  await prisma.subject.upsert({
    where: { slug: "english-ssc" },
    update: {},
    create: { slug: "english-ssc", name: "English", namebn: "ইংরেজি", isCommon: true, level: "SSC" },
  });
  await prisma.subject.upsert({
    where: { slug: "general-math-ssc" },
    update: {},
    create: { slug: "general-math-ssc", name: "General Math", namebn: "সাধারণ গণিত", isCommon: true, level: "SSC" },
  });
  await prisma.subject.upsert({
    where: { slug: "ict-ssc" },
    update: {},
    create: { slug: "ict-ssc", name: "ICT", namebn: "তথ্য ও যোগাযোগ প্রযুক্তি", isCommon: true, level: "SSC" },
  });

  // HSC common subjects
  await prisma.subject.upsert({
    where: { slug: "bangla-1st-paper" },
    update: {},
    create: { slug: "bangla-1st-paper", name: "Bangla 1st Paper", namebn: "বাংলা ১ম পত্র", isCommon: true, level: "HSC" },
  });
  await prisma.subject.upsert({
    where: { slug: "bangla-2nd-paper" },
    update: {},
    create: { slug: "bangla-2nd-paper", name: "Bangla 2nd Paper", namebn: "বাংলা ২য় পত্র", isCommon: true, level: "HSC" },
  });
  await prisma.subject.upsert({
    where: { slug: "english-1st-paper" },
    update: {},
    create: { slug: "english-1st-paper", name: "English 1st Paper", namebn: "ইংরেজি ১ম পত্র", isCommon: true, level: "HSC" },
  });
  await prisma.subject.upsert({
    where: { slug: "english-2nd-paper" },
    update: {},
    create: { slug: "english-2nd-paper", name: "English 2nd Paper", namebn: "ইংরেজি ২য় পত্র", isCommon: true, level: "HSC" },
  });
  await prisma.subject.upsert({
    where: { slug: "ict-hsc" },
    update: {},
    create: { slug: "ict-hsc", name: "ICT", namebn: "তথ্য ও যোগাযোগ প্রযুক্তি", isCommon: true, level: "HSC" },
  });

  // SSC Science subjects
  const physics = await prisma.subject.upsert({
    where: { slug: "physics-ssc" },
    update: {},
    create: { slug: "physics-ssc", name: "Physics", namebn: "পদার্থবিজ্ঞান", divisionId: sscScience.id },
  });
  await prisma.subject.upsert({
    where: { slug: "chemistry-ssc" },
    update: {},
    create: { slug: "chemistry-ssc", name: "Chemistry", namebn: "রসায়ন", divisionId: sscScience.id },
  });
  await prisma.subject.upsert({
    where: { slug: "biology-ssc" },
    update: {},
    create: { slug: "biology-ssc", name: "Biology", namebn: "জীববিজ্ঞান", divisionId: sscScience.id },
  });

  // Sample exam
  const exam = await prisma.exam.upsert({
    where: { slug: "physics-chapter-1-mcq" }, update: {},
    create: {
      title: "Physics Chapter 1 MCQ",
      titlebn: "পদার্থবিজ্ঞান অধ্যায় ১",
      slug: "physics-chapter-1-mcq",
      divisionId: sscScience.id,
      subjectId: physics.id,
      timeLimitMin: 30,
      randomize: true,
      published: true,
    },
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
