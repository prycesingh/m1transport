import { IncidentReportForm } from "@/components/IncidentReportForm";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";

type Todo = {
  id: string | number;
  name: string;
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: todos } = await supabase.from("todos").select("id, name");

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <header className="bg-sky-600 text-primary-foreground shadow-[var(--shadow-elevated)]">
        <div className="container max-w-5xl mx-auto px-4 py-6 flex items-center gap-4">
          <div className="backdrop-blur p-3 rounded-lg">
            <Image
              src="/logo.png"
              alt="M1 Transports"
              width={72}
              height={72}
              className="w-18 aspect-square object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              M1 TRANSPORTS
            </h1>
            <p className="text-sm text-primary-foreground/80">
              Safety &amp; Compliance
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="bg-card rounded-xl border shadow-[var(--shadow-card)] p-6 mb-6">
          <h2 className="text-2xl font-bold text-center text-primary mb-2">
            IRF Incident Report Form
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            All injuries, motor vehicle and non-motor vehicle incidents,
            hazards, and near misses must be reported within 24 hours to the
            Safety and Compliance Department.
          </p>
        </div>

        <IncidentReportForm />

        <section className="mt-8 bg-card rounded-xl border shadow-[var(--shadow-card)] p-6">
          <h3 className="text-lg font-semibold mb-3">Supabase Todos</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {(todos as Todo[] | null)?.map((todo) => (
              <li key={todo.id}>{todo.name}</li>
            ))}
          </ul>
        </section>

        <footer className="text-center text-xs text-muted-foreground mt-12 py-6">
          Copyright {new Date().getFullYear()} M1 Transports. Safety and
          Compliance.
        </footer>
      </main>
    </div>
  );
}
