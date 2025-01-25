"use server";

import sharp from "sharp";
import { OutputFileType } from "@/types/outputFileType";

export async function compressImage(
  imageString: string,
  quality: number,
  outputFileType: string,
) {
  const buffer = Buffer.from(imageString, "base64");
  let compressedImage: Buffer;
  switch (outputFileType) {
    case OutputFileType.JPEG:
      compressedImage = await sharp(buffer).jpeg({ quality }).toBuffer();
      break;
    case OutputFileType.PNG:
      compressedImage = await sharp(buffer)
        .png({ compressionLevel: 6 })
        .toBuffer();
      break;
    case OutputFileType.WEBP:
      compressedImage = await sharp(buffer).webp({ quality }).toBuffer();
      break;
    default:
      compressedImage = await sharp(buffer).jpeg({ quality }).toBuffer();
      break;
  }
  return compressedImage.toString("base64");
}
