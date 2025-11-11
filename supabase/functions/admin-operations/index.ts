import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper: Verify user is admin
async function verifyAdminAccess(authHeader: string | undefined) {
  try {
    // Extract JWT from Authorization header
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return { isAdmin: false, error: "Missing authorization token" };
    }

    // Verify token and get user
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return { isAdmin: false, error: "Invalid token" };
    }

    // Check if user is admin in user_profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return { isAdmin: false, error: "User is not an admin" };
    }

    return { isAdmin: true, userId: user.id, email: user.email };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { isAdmin: false, error: errorMessage };
  }
}

serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Verify admin access
    const authHeader = req.headers.get("authorization") ?? undefined;
    const { isAdmin, error: authError, userId } = await verifyAdminAccess(
      authHeader
    );

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: authError }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { operation, email, password, userId: targetUserId, newPassword } =
      await req.json();

    // Handle different operations
    switch (operation) {
      case "create_user": {
        // Create new user with auth account
        const { data: authUser, error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });

        if (createError) {
          return new Response(
            JSON.stringify({
              success: false,
              error: createError.message,
              operation: "create_user",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: { userId: authUser.user.id, email: authUser.user.email },
            operation: "create_user",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      case "delete_user": {
        // Delete user account (both auth and profile)
        if (!targetUserId) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing userId parameter",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const { error: deleteError } =
          await supabaseAdmin.auth.admin.deleteUser(targetUserId);

        if (deleteError) {
          return new Response(
            JSON.stringify({
              success: false,
              error: deleteError.message,
              operation: "delete_user",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `User ${targetUserId} deleted successfully`,
            operation: "delete_user",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      case "update_password": {
        // Update user password
        if (!targetUserId || !newPassword) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing userId or newPassword parameter",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const { data: updateData, error: updateError } =
          await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
            password: newPassword,
          });

        if (updateError) {
          return new Response(
            JSON.stringify({
              success: false,
              error: updateError.message,
              operation: "update_password",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Password updated for user ${targetUserId}`,
            operation: "update_password",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      case "get_user_by_email": {
        // Get user by email
        if (!email) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Missing email parameter",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const { data: userData, error: getUserError } =
          await supabaseAdmin.auth.admin.getUserByIdentifier(email);

        if (getUserError) {
          return new Response(
            JSON.stringify({
              success: false,
              error: getUserError.message,
              operation: "get_user_by_email",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: { userId: userData.user.id, email: userData.user.email },
            operation: "get_user_by_email",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      default: {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Unknown operation: ${operation}`,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
