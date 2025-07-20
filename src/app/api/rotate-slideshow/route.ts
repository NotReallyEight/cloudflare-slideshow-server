import { supabase } from "@/lib/supabase";
import { withBearerAuth } from "@/lib/withAuth";

type ListFoldersResponse = {
  status: number;
  message: string;
  folders: string[];
};

const handler = async () => {
  try {
    const { data, error, status } = await supabase
      .from("slideshow_control")
      .select();

    if (error)
      return Response.json({
        status,
        message: "Failed to fetch slideshow control data",
        details: error.message,
      });

    if (data.length === 0) {
      return Response.json({
        status: 404,
        message: "No slideshow control data found",
      });
    }

    const currentSlideShow = data[0];

    const res = await fetch(
      new URL(
        "api/list-folders",
        process.env.NEXT_PUBLIC_BASE_URL ?? ""
      ).toString(),
      {
        headers: {
          Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
        },
      }
    );

    const { folders }: ListFoldersResponse = await res.json();

    const updatedFolderIndex =
      folders.indexOf(
        `Pictures/${currentSlideShow.source}/${currentSlideShow.active_year}/${currentSlideShow.active_month}/`
      ) + 1;

    const [, source, year, month] =
      updatedFolderIndex >= folders.length
        ? folders[0].split("/")
        : folders[updatedFolderIndex].split("/");

    const updatedControl = await supabase
      .from("slideshow_control")
      .update({
        active_month: month,
        active_year: year,
        source,
      })
      .eq("id", currentSlideShow.id);

    if (updatedControl.error) {
      return Response.json({
        status: updatedControl.status,
        message: "Failed to update slideshow control",
        details: updatedControl.error.message,
      });
    }

    return Response.json({
      status: 200,
      message: "Slideshow rotated successfully",
      folder: folders[updatedFolderIndex],
    });
  } catch (err: unknown) {
    return Response.json({
      status: 500,
      message: "Failed to rotate slideshow",
      details: (err as Error).message,
    });
  }
};

export const POST = withBearerAuth(handler);
