import { getLesson, LESSONS, type Lesson } from "@/lib/academy/lessons";

export type ChapterDefinition = {
  slug: string;
  title: string;
  description: string;
  lessonSlugs: string[];
};

/** Existing lessons, grouped. No new lesson text is invented here. */
export const CHAPTERS: ChapterDefinition[] = [
  {
    slug: "online-threats",
    title: "Understanding Online Threats",
    description: "How pressure, secrecy, and a fake deadline show up in a message.",
    lessonSlugs: ["pressure-tactics"],
  },
  {
    slug: "phishing-messages",
    title: "Phishing and Suspicious Messages",
    description: "Messages and links that try to hurry you into handing over a secret.",
    lessonSlugs: ["spotting-phishing", "suspicious-links"],
  },
  {
    slug: "passwords",
    title: "Passwords and Account Security",
    description: "Keeping passwords and login codes to yourself.",
    lessonSlugs: ["passwords-and-accounts"],
  },
  {
    slug: "opportunity-scams",
    title: "Scholarship and Job Scams",
    description: "Offers that ask for a fee, secrecy, or a payment before you can check them.",
    lessonSlugs: ["scholarship-job-scams"],
  },
  {
    slug: "social-media",
    title: "Social Media Safety",
    description: "Cruel messages, rumours, and posts that have lost their source.",
    lessonSlugs: ["cyberbullying", "verify-before-sharing"],
  },
  {
    slug: "staying-safe",
    title: "Staying Safe Online",
    description: "What to leave off a public profile, and what not to send in a chat.",
    lessonSlugs: ["personal-information"],
  },
];

export type PublicQuestion = {
  prompt: string;
  choices: string[];
};

export type PublicLesson = {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  chapterSlug: string;
  chapterTitle: string;
  objectives: string[];
  sections: Lesson["sections"];
  questions: PublicQuestion[];
};

export function orderedSlugs(): string[] {
  return CHAPTERS.flatMap((chapter) => chapter.lessonSlugs);
}

export function chapterForSlug(slug: string): ChapterDefinition | undefined {
  return CHAPTERS.find((chapter) => chapter.lessonSlugs.includes(slug));
}

export function toPublicLesson(lesson: Lesson): PublicLesson {
  const chapter = chapterForSlug(lesson.slug);
  return {
    slug: lesson.slug,
    title: lesson.title,
    minutes: lesson.minutes,
    summary: lesson.summary,
    chapterSlug: chapter?.slug ?? "",
    chapterTitle: chapter?.title ?? "Digital Safety Academy",
    objectives: lesson.sections.map((section) => section.heading),
    sections: lesson.sections,
    questions: lesson.questions.map((question) => ({
      prompt: question.prompt,
      choices: question.choices,
    })),
  };
}

export function lessonAt(slug: string): Lesson | undefined {
  return getLesson(slug);
}

export function neighbourSlugs(slug: string): { previous: string | null; next: string | null } {
  const order = orderedSlugs();
  const index = order.indexOf(slug);
  if (index < 0) return { previous: null, next: null };
  return {
    previous: index > 0 ? order[index - 1] ?? null : null,
    next: index < order.length - 1 ? order[index + 1] ?? null : null,
  };
}

export function curriculumLessons(): Lesson[] {
  return orderedSlugs().map((slug) => {
    const lesson = getLesson(slug);
    if (!lesson) throw new Error(`Missing lesson ${slug}`);
    return lesson;
  });
}

export function everyListedLessonIsReal(): boolean {
  const slugs = new Set(LESSONS.map((lesson) => lesson.slug));
  return orderedSlugs().every((slug) => slugs.has(slug));
}
