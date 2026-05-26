import { headers } from "next/headers"
import { Webhook } from "svix"
import { prisma } from "@/lib/prisma"

type ClerkUserCreatedEvent = {
  type: "user.created"
  data: {
    id: string
    email_addresses: { email_address: string; id: string }[]
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
  }
}

type ClerkUserUpdatedEvent = {
  type: "user.updated"
  data: {
    id: string
    email_addresses: { email_address: string; id: string }[]
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
  }
}

type ClerkUserDeletedEvent = {
  type: "user.deleted"
  data: { id: string }
}

type ClerkWebhookEvent =
  | ClerkUserCreatedEvent
  | ClerkUserUpdatedEvent
  | ClerkUserDeletedEvent

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret || webhookSecret === "whsec_...") {
    // Webhook not configured yet — skip silently in dev
    return new Response("Webhook secret not configured", { status: 200 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const body = await req.text()

  const wh = new Webhook(webhookSecret)
  let event: ClerkWebhookEvent

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent
  } catch {
    return new Response("Invalid webhook signature", { status: 400 })
  }

  if (event.type === "user.created") {
    const { id, email_addresses, primary_email_address_id, first_name, last_name } = event.data

    const primaryEmail = email_addresses.find(
      (e) => e.id === primary_email_address_id
    )?.email_address

    if (!primaryEmail) {
      return new Response("No primary email", { status: 400 })
    }

    await prisma.user.create({
      data: {
        clerkId: id,
        email: primaryEmail,
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        plan: "FREE",
      },
    })
  }

  if (event.type === "user.updated") {
    const { id, email_addresses, primary_email_address_id, first_name, last_name } = event.data

    const primaryEmail = email_addresses.find(
      (e) => e.id === primary_email_address_id
    )?.email_address

    await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: primaryEmail,
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
      },
    })
  }

  if (event.type === "user.deleted") {
    await prisma.user.delete({
      where: { clerkId: event.data.id },
    })
  }

  return new Response("OK", { status: 200 })
}
