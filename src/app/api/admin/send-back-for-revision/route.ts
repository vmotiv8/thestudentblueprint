import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/admin-auth"
import { createServerSupabaseClient } from "@/lib/supabase"
import { sendRevisionEmail } from "@/lib/resend"

export async function POST(request: NextRequest) {
  try {
    const auth = await getAdminAuth()
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assessmentId, message } = await request.json()
    if (!assessmentId) {
      return NextResponse.json({ error: "Assessment ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: assessment, error: fetchError } = await supabase
      .from("assessments")
      .select(`
        id,
        status,
        student:students (
          full_name,
          email,
          unique_code
        )
      `)
      .eq("id", assessmentId)
      .single()

    if (fetchError || !assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    const student = Array.isArray(assessment.student) ? assessment.student[0] : assessment.student
    if (!student?.email) {
      return NextResponse.json({ error: "Student email not found" }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("assessments")
      .update({
        status: 'in_progress',
      })
      .eq("id", assessmentId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update assessment status" }, { status: 500 })
    }

    const emailResult = await sendRevisionEmail(
      student.email,
      student.full_name,
      student.unique_code,
      message
    )

    if (!emailResult.success) {
      return NextResponse.json({ error: "Assessment updated but failed to send email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Assessment sent back to ${student.full_name} for revision`
    })
  } catch (error) {
    console.error("Send back for revision error:", error)
    return NextResponse.json({ error: "Failed to send assessment back for revision" }, { status: 500 })
  }
}
