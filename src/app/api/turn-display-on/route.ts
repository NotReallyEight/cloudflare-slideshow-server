import { supabase } from "@/lib/supabase";
import { withBearerAuth } from "@/lib/withAuth";

const handler = async () => {
  try {
    const {
      data: oldData,
      error: oldError,
      error: oldStatus,
    } = await supabase.from("slideshow_control").select();

    if (oldError)
      return Response.json({
        status: oldStatus,
        message: "Failed to fetch slideshow control data",
        details: oldError.message,
      });

    if (oldData.length === 0) {
      return Response.json({
        status: 404,
        message: "No slideshow control data found",
      });
    }

    await supabase
      .from("slideshow_control")
      .update({
        display_on: true,
      })
      .eq("id", oldData[0].id);

    return Response.json({
      status: 200,
      message: "Display turned on successfully",
    });
  } catch (err: unknown) {
    return Response.json({
      status: 500,
      message: "An error occurred while turning on the display",
      details: (err as Error).message,
    });
  }
};

export const POST = withBearerAuth(handler);
