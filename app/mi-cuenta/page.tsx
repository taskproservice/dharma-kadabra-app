import { CustomerAuthForm } from "../../components/customer-auth-form";
import { CustomerAccount, type CustomerAppointment, type CustomerAudio, type CustomerPurchase } from "../../components/customer-account";
import { getCustomerSession } from "../../lib/customer-auth";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function CustomerAccountPage() {
  const session = await getCustomerSession();
  if (!session) return <CustomerAuthForm />;

  const [allAppointments, purchases, audios] = await Promise.all([
    prisma.appointment.findMany({ where: { date: { gte: new Date() } }, orderBy: { date: "asc" } }),
    prisma.purchase.findMany({ where: { customerId: session.id }, include: { product: true }, orderBy: { purchasedAt: "desc" } }),
    prisma.audioPurchase.findMany({ where: { customerId: session.id }, orderBy: { purchasedAt: "desc" } }),
  ]);
  const appointments: CustomerAppointment[] = allAppointments
    .filter((appointment: { clientEmail: string; customerId?: string | null }) => appointment.customerId === session.id || appointment.clientEmail.toLowerCase() === session.email.toLowerCase())
    .map((appointment: { id: string; clientName: string; date: Date; service: string; status: string; depositPaid: boolean }) => ({ ...appointment, date: appointment.date.toISOString() }));
  const customerPurchases: CustomerPurchase[] = purchases.map((purchase: { id: string; title: string; purchasedAt: Date; product?: { imageUrl: string } | null }) => ({
    id: purchase.id, title: purchase.title, purchasedAt: purchase.purchasedAt.toISOString(), product: purchase.product ? { imageUrl: purchase.product.imageUrl } : null,
  }));
  const customerAudios: CustomerAudio[] = audios.map((audio: { id: string; title: string; purchasedAt: Date; audioUrl?: string | null }) => ({
    id: audio.id, title: audio.title, purchasedAt: audio.purchasedAt.toISOString(), audioUrl: audio.audioUrl,
  }));

  return <CustomerAccount customer={{ name: session.name, email: session.email }} appointments={appointments} purchases={customerPurchases} audios={customerAudios} />;
}
