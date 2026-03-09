import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { validateRequest, deleteAssessmentSchema } from "@/lib/validations"

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin_session")?.value

    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const validation = await validateRequest(request, deleteAssessmentSchema)
    if (!validation.success) {
      return validation.error
    }

    const { assessmentId } = validation.data
    const supabase = createServerSupabaseClient()

    // Verify admin exists
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id, email, organization_id, role")
      .eq("id", adminSession)
      .single()

    if (adminError || !admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: assessment, error: fetchError } = await supabase
      .from("assessments")
      .select("student_id, organization_id, students(full_name, email)")
      .eq("id", assessmentId)
      .maybeSingle()

    if (fetchError) {
      console.error("Fetch assessment error:", fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // Verify the admin has access to this assessment's organization
    if (admin.role !== "super_admin" && admin.role !== "god" && assessment.organization_id !== admin.organization_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const studentInfo = (assessment as { students?: { full_name?: string; email?: string } }).students
    const studentName = studentInfo?.full_name || "Unknown"
    const studentEmail = studentInfo?.email || "Unknown"

    const { error: deleteAssessmentError } = await supabase
      .from("assessments")
      .delete()
      .eq("id", assessmentId)

    if (deleteAssessmentError) {
      console.error("Delete assessment error:", deleteAssessmentError)
      return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 })
    }

    if (assessment.student_id) {
      const { error: deleteStudentError } = await supabase
        .from("students")
        .delete()
        .eq("id", assessment.student_id)

      if (deleteStudentError) {
        console.error("Failed to delete student:", deleteStudentError)
      }
    }

    // Log the action
    const { logAction } = await import("@/lib/audit")
    await logAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "delete_assessment",
      entityType: "assessment",
      entityId: assessmentId,
      details: {
        student_name: studentName,
        student_email: studentEmail,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Assessment deleted successfully"
    })
  } catch (error) {
    console.error("Delete assessment error:", error)
    return NextResponse.json({ error: "Failed to delete assessment" }, { status: 500 })
  }
}
