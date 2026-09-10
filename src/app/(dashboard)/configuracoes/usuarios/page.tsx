import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { ConviteForm } from "@/components/configuracoes/convite-form";
import { UsuarioRowActions } from "@/components/configuracoes/usuario-row-actions";

export const metadata = { title: "Usuários" };

export default async function UsuariosPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data: usuarios } = await supabase.from("profiles").select("*").order("full_name");

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gerencie o acesso da equipe à plataforma."
        action={<ConviteForm />}
      />

      <Table>
        <Thead>
          <tr>
            <Th>Usuário</Th>
            <Th>E-mail</Th>
            <Th>Status</Th>
            <Th></Th>
          </tr>
        </Thead>
        <Tbody>
          {(usuarios ?? []).map((u) => (
            <Tr key={u.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar name={u.full_name} src={u.avatar_url} />
                  <div>
                    <p className="font-medium text-azul-950">{u.full_name}</p>
                    <p className="text-xs text-preto/50">{u.role === "admin" ? "Administrador" : "Equipe"}</p>
                  </div>
                </div>
              </Td>
              <Td>{u.email}</Td>
              <Td><Badge tone={u.active ? "verde" : "neutral"}>{u.active ? "Ativo" : "Inativo"}</Badge></Td>
              <Td><UsuarioRowActions usuario={u} isSelf={u.id === admin.id} /></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
