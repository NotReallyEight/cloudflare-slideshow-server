import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { client } from "@/lib/s3";
import { withBearerAuth } from "@/lib/withAuth";

const handler = async () => {
  try {
    const listObjects = async (prefix = "Pictures/") => {
      const command = new ListObjectsV2Command({
        Bucket: process.env.BUCKET_NAME ?? "",
        Prefix: prefix,
        Delimiter: "/",
      });
      const response = await client.send(command);

      return response.CommonPrefixes?.map(({ Prefix }) => Prefix ?? "") ?? [];
    };
    const categories = await listObjects();
    if (categories === undefined) {
      return Response.json({
        error: "No categories found",
      });
    }
    const results = [];

    for (let i = 0; i < categories.length; i++) {
      const years = await listObjects(categories[i]);
      for (let j = 0; j < years.length; j++) {
        const months = await listObjects(years[j]);
        for (let k = 0; k < months.length; k++) {
          results.push(months[k]);
        }
      }
    }

    return Response.json({
      status: 200,
      message: "Folders listed successfully",
      folders: results,
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
