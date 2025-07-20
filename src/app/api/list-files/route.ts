import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { client } from "@/lib/s3";
import type { NextRequest } from "next/server";
import { withBearerAuth } from "@/lib/withAuth";

const handler = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;

    const folderName = searchParams.get("folder") ?? "";

    const command = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME ?? "",
      Prefix: folderName,
    });

    const files = await client.send(command);

    if (files.Contents?.length === 0)
      return Response.json({
        status: 404,
        message: "No files found in the specified folder",
      });

    return Response.json({
      status: 200,
      files: files.Contents?.filter((file) => !file.Key?.includes(".low.")).map(
        (filteredFile) => ({
          key: filteredFile.Key ?? "",
          publicUrl: new URL(
            filteredFile.Key ?? "",
            process.env.PUBLIC_CDN_URL ?? ""
          ).toString(),
        })
      ),
    });
  } catch (err: unknown) {
    return Response.json({
      status: 500,
      message: "Failed to list folders",
      details: (err as Error).message,
    });
  }
};

export const GET = withBearerAuth(handler);
