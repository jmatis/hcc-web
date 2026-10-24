import type { APIRoute } from "astro";
import { addMemberApplication, readMemberDetails, validateMemberDetails } from "../../lib/members";
import { getRuntimeEnv } from "../../lib/runtime";
import { requestHasValidOrigin, verifyTurnstile } from "../../lib/security";

export const POST: APIRoute = async ({ request }) => {
  const redirect = (query: string) => Response.redirect(new URL(`/join?${query}`, request.url), 303);
  if (!requestHasValidOrigin(request)) return redirect("error=origin");

  const form = await request.formData();
  if (String(form.get("website") ?? "")) return redirect("submitted=1");

  const env = getRuntimeEnv();
  const turnstileOk = await verifyTurnstile(
    request,
    String(form.get("cf-turnstile-response") ?? ""),
    env.TURNSTILE_SECRET_KEY,
  );
  if (!turnstileOk) return redirect("error=verification");

  const details = readMemberDetails(form);
  if (validateMemberDetails(details).length > 0) return redirect("error=details");

  await addMemberApplication(env.DB, details);
  return redirect("submitted=1");
};

export const ALL: APIRoute = () => new Response("Method not allowed", { status: 405 });
