import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

const MAX_BASE64_BYTES = 5 * 1024 * 1024; // ~5MB

const avatarSchema = z.object({
  image: z.string().startsWith("data:image/", "Invalid image format"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = avatarSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  if (parsed.data.image.length > MAX_BASE64_BYTES) {
    return NextResponse.json(
      { error: "Image is too large. Please choose a file under 5MB." },
      { status: 413 }
    );
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { imagePublicId: true },
    });

    const { url, publicId } = await uploadImage(
      parsed.data.image,
      "homevault/avatars"
    );

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: url, imagePublicId: publicId },
      select: { image: true },
    });

    if (existing?.imagePublicId) {
      await deleteImage(existing.imagePublicId).catch(() => null);
    }

    return NextResponse.json({ image: user.image });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
