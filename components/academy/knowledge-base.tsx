import { readingChapters } from "@/lib/academy/curriculum";
import { getLesson } from "@/lib/academy/lessons";

export function KnowledgeBase() {
  const chapters = readingChapters();
  return (
    <div>
      <p className="text-sm font-semibold text-primary">Digital Safety Academy</p>
      <h1 className="mt-1 text-3xl font-bold">Intro to cybersecurity</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Read these lessons in any order. After you open the Academy once while online, this reading stays on the device. A quiz score still needs a connection. The lessons lower risk. They do not make a phone or a message completely safe.
      </p>
      <div className="mt-6 space-y-4">
        {chapters.map((chapter) => (
          <section key={chapter.slug} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-ink/5" aria-labelledby={`${chapter.slug}-heading`}>
            <h2 id={`${chapter.slug}-heading`} className="text-xl font-bold">{chapter.title}</h2>
            <p className="mt-1 text-sm text-muted">{chapter.description}</p>
            <div className="mt-4 space-y-3">
              {chapter.lessonSlugs.map((slug) => {
                const lesson = getLesson(slug);
                if (!lesson) return null;
                return (
                  <details key={slug} id={slug} className="rounded-2xl bg-canvas px-4 py-3" open={slug === chapters[0]?.lessonSlugs[0]}>
                    <summary className="cursor-pointer font-semibold">
                      {lesson.title}
                      <span className="ml-2 text-sm font-normal text-muted">{lesson.minutes} min</span>
                    </summary>
                    <p className="mt-2 text-sm leading-6 text-muted">{lesson.summary}</p>
                    {lesson.sections.map((section) => (
                      <div key={section.heading} className="mt-4">
                        <h3 className="font-bold">{section.heading}</h3>
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph} className="mt-2 text-sm leading-6">{paragraph}</p>
                        ))}
                        {section.example ? <p className="mt-2 rounded-2xl bg-sun/50 p-3 text-sm">Example: {section.example}</p> : null}
                      </div>
                    ))}
                  </details>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
