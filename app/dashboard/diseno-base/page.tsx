import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default function DisenoBasePage() {
  redirect("/dashboard/diseno");
}
