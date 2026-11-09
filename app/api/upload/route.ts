import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required.",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{
      secure_url: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "citycare/complaints",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result?.secure_url) {
            reject(new Error("Cloudinary did not return an image URL."));
            return;
          }

          resolve({
            secure_url: result.secure_url,
          });
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json(
      {
        success: true,
        imageUrl: uploadResult.secure_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image.",
      },
      { status: 500 }
    );
  }
}