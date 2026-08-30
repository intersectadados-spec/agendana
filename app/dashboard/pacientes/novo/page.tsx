import PacienteForm from "@/components/PacienteForm";
import { criarPaciente } from "@/lib/actions";

export default function NovoPacientePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl text-wine">Novo paciente</h2>
      <PacienteForm action={criarPaciente} />
    </div>
  );
}
