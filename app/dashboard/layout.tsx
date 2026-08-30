import { sair } from "@/lib/actions";
import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Resumo" },
  { href: "/dashboard/agenda", label: "Agenda" },
  { href: "/dashboard/pacientes", label: "Pacientes" },
  { href: "/dashboard/financeiro", label: "Financeiro" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-56 bg-white border-b md:border-b-0 md:border-r border-line flex md:flex-col">
        <div className="p-5 hidden md:block">
          <div className="flex justify-center mb-4">
            <img
              src="/ana-paula.jpeg"
              alt="Ana Paula Tomacheski"
              className="w-24 h-24 rounded-full object-cover border-2 border-blush"
            />
          </div>
          <h1 className="text-2xl text-wine leading-none text-center">Agenda Ana</h1>
          <p className="text-xs text-muted mt-1 text-center">Ana Paula Tomacheski</p>
        </div>

        <nav className="flex md:flex-col gap-1 p-3 flex-1 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-cream whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form action={sair} className="p-3 hidden md:block">
          <button type="submit" className="btn-ghost w-full text-sm">
            Sair
          </button>
        </form>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-5 md:p-8 max-w-5xl w-full mx-auto">{children}</main>
        <footer className="text-center text-xs text-muted py-6">
          Psico Tomacheski Company
        </footer>
      </div>
    </div>
  );
}