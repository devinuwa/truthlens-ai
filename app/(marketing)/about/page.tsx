export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">About TruthLens AI</h1>
      <div className="mt-4 space-y-4 text-sm leading-6 text-muted">
        <p>
          TruthLens AI is an original student project for HIASFEST 2027, Category K: ICT and Technology. It is a digital-safety companion for secondary-school students, teenagers, and young people looking at scholarships.
        </p>
        <p>
          The app explains warning signs in messages and links. It does not claim that a quiet result means something is safe, and it does not decide that a news claim is false from writing style alone.
        </p>
        <p>
          Message and link checks work for guests. Accounts, saved reports, and saved opportunities need a Supabase project. The optional Python service adds a machine-learning score only after a model has been trained and evaluated.
        </p>
      </div>
    </article>
  );
}
