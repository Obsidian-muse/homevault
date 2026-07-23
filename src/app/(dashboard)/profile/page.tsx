import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = { title: "Profile | HomeVault" };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      phone: true,
      address: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">View and update your account details.</p>
      </div>
      <ProfileForm
        initialName={user.name ?? ""}
        email={user.email}
        image={user.image}
        phone={user.phone}
        address={user.address}
      />
    </div>
  );
}
