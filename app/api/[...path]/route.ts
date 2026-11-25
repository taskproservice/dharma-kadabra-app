import { NextResponse } from "next/server";
import * as analytics from "../analytics/handler";
import * as appointments from "../appointments/handler";
import * as appointmentById from "../appointments/[id]/handler";
import * as nextAuth from "../auth/[...nextauth]/handler";
import * as availability from "../availability/handler";
import * as availabilityMe from "../availability/me/handler";
import * as collaborators from "../collaborators/handler";
import * as cozy from "../cozy/handler";
import * as notifications from "../cron/notifications/handler";
import * as customerAuth from "../customer-auth/handler";
import * as events from "../events/handler";
import * as checkout from "../pos/checkout/handler";
import * as products from "../products/handler";
import * as productUpload from "../products/upload/handler";
import * as storeProducts from "../store/products/handler";
import * as storeTemplates from "../store/templates/handler";
import * as storeTrack from "../store/track/handler";
import * as systemSettings from "../system/settings/handler";
import * as tour from "../tour/handler";
import * as tourUpload from "../tour/upload/handler";
import * as users from "../users/handler";
import * as userById from "../users/[id]/handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ApiHandler = (...args: any[]) => Response | Promise<Response>;
type HandlerGroup = Partial<Record<HttpMethod, ApiHandler>>;
type RouteContext = { params: Promise<{ path: string[] }> };
type HandlerContext = { params: Promise<unknown> };

/**
 * All public and internal API URLs are served by this single function. The
 * legacy URLs remain unchanged; only the Next.js deployment entrypoint is
 * consolidated here.
 */
const routeHandlers: Record<string, HandlerGroup> = {
  analytics: { GET: analytics.GET },
  appointments: { POST: appointments.POST },
  "appointments/[id]": { PATCH: appointmentById.PATCH },
  "auth/[...nextauth]": { GET: nextAuth.GET, POST: nextAuth.POST },
  availability: { GET: availability.GET },
  "availability/me": { GET: availabilityMe.GET, PUT: availabilityMe.PUT },
  collaborators: { GET: collaborators.GET },
  cozy: { POST: cozy.POST },
  "cron/notifications": { GET: notifications.GET, POST: notifications.POST },
  "customer-auth": { POST: customerAuth.POST, DELETE: customerAuth.DELETE },
  events: { POST: events.POST },
  "pos/checkout": { POST: checkout.POST },
  products: {
    GET: products.GET,
    POST: products.POST,
    PUT: products.PUT,
    DELETE: products.DELETE,
  },
  "products/upload": { POST: productUpload.POST },
  "store/products": { GET: storeProducts.GET },
  "store/templates": { GET: storeTemplates.GET, PUT: storeTemplates.PUT },
  "store/track": { POST: storeTrack.POST },
  "system/settings": { GET: systemSettings.GET, PATCH: systemSettings.PATCH },
  tour: { GET: tour.GET, PUT: tour.PUT, PATCH: tour.PATCH },
  "tour/upload": { POST: tourUpload.POST },
  users: { GET: users.GET, POST: users.POST },
  "users/[id]": { PATCH: userById.PATCH },
};

function resolveEndpoint(path: string[]) {
  if (path[0] === "auth" && path.length > 1) {
    return { key: "auth/[...nextauth]", params: { nextauth: path.slice(1) } };
  }
  if (path[0] === "appointments" && path.length === 2) {
    return { key: "appointments/[id]", params: { id: path[1] } };
  }
  if (path[0] === "users" && path.length === 2) {
    return { key: "users/[id]", params: { id: path[1] } };
  }
  return { key: path.join("/"), params: undefined };
}

async function dispatch(request: Request, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const endpoint = resolveEndpoint(path);
  const group = routeHandlers[endpoint.key];
  if (!group) {
    return NextResponse.json({ error: "API route not found." }, { status: 404 });
  }

  const method = request.method.toUpperCase() as HttpMethod;
  const handler = group[method];
  if (!handler) {
    return NextResponse.json(
      { error: "Method not allowed." },
      { status: 405, headers: { Allow: getAllowedMethods(group).join(", ") } },
    );
  }

  const handlerContext: HandlerContext | undefined = endpoint.params
    ? { params: Promise.resolve(endpoint.params) }
    : undefined;
  return await handler(request, handlerContext);
}

function getAllowedMethods(group: HandlerGroup) {
  const methods: string[] = Object.keys(group);
  if (group.GET) methods.push("HEAD");
  methods.push("OPTIONS");
  return [...new Set(methods)];
}

export async function GET(request: Request, context: RouteContext) {
  return dispatch(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return dispatch(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return dispatch(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return dispatch(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return dispatch(request, context);
}

export async function HEAD(request: Request, context: RouteContext) {
  const getRequest = new Request(request.url, { method: "GET", headers: request.headers });
  const response = await dispatch(getRequest, context);
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function OPTIONS(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  const endpoint = resolveEndpoint(path);
  const group = routeHandlers[endpoint.key];
  if (!group) return new Response(null, { status: 404 });

  const methods: string[] = Object.keys(group);
  if (group.GET) methods.push("HEAD");
  methods.push("OPTIONS");
  return new Response(null, { status: 204, headers: { Allow: [...new Set(methods)].join(", ") } });
}
