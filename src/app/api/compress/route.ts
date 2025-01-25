import { compressImage } from "@/app/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, quality, outputFileType } = await req.json();
    const compressedImage = await compressImage(image, quality, outputFileType);
    return NextResponse.json({ compressedImage });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to compress image: ${error}` },
      { status: 500 },
    );
  }
}