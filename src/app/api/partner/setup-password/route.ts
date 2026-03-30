import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data: partner, error } = await supabase
      .from("referral_partners")
      .select("id, email, password_setup_expires")
      .eq("password_setup_token", token)
      .single()

    if (error || !partner) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    if (new Date(partner.password_setup_expires) < new Date()) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      email: partner.email,
    })
  } catch (error) {
    console.error("Error validating token:", error)
    const message = error instanceof Error ? error.message : 'Failed to validate token'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data: partner, error: fetchError } = await supabase
      .from("referral_partners")
      .select("id, email, password_setup_expires")
      .eq("password_setup_token", token)
      .single()

    if (fetchError || !partner) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    if (new Date(partner.password_setup_expires) < new Date()) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const { error: updateError } = await supabase
      .from("referral_partners")
      .update({
        password_hash: passwordHash,
        password_setup_token: null,
        password_setup_expires: null,
      })
      .eq("id", partner.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, email: partner.email })
  } catch (error) {
    console.error("Error setting up password:", error)
    const message = error instanceof Error ? error.message : 'Failed to set password'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
