import type { APIRoute } from "astro";
import { getMemberIdentity } from "../../lib/auth";
import { getMember, readMemberDetails, updateMember, validateMemberDetails } from "../../lib/members";
import { getRuntimeEnv } from "../../lib/runtime";
import { requestHasValidOrigin } from "../../lib/security";

export const POST: APIRoute = async ({ request }) => {
  const redirect = (query: string) => Response.redirect(new URL(`/members?${query}`, request.url), 303);
  if (!requestHasValidOrigin(request)) return redirect("error=origin");

  const env = getRuntimeEnv();
  const identity = await getMemberIdentity(request, env);
  if (!identity) return new Response("Authentication required", { status: 401 });

  const member = await getMember(env.DB, identity.email);
  if (!member) return new Response("Membership record not found", { status: 404 });

  const form = await request.formData();
  const details = readMemberDetails(form);
  details.firstName = member.first_name;
  details.lastName = member.last_name;
  if (validateMemberDetails(details, false).length > 0) return redirect("error=details");

  const changed = await updateMember(env.DB, identity.email, details);
  return changed ? redirect("updated=1") : redirect("error=save");
};

export const ALL: APIRoute = () => new Response("Method not allowed", { status: 405 });
