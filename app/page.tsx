import { redirect } from "next/navigation"

export default function HomePage() {
  // O middleware cuida do redirecionamento baseado na autenticacao
  // Este redirect é apenas um fallback
  redirect("/dashboard")
}
