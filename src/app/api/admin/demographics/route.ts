import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin_session")?.value

    if (!adminSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Verify admin and get their organization
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id, organization_id, role")
      .eq("id", adminSession)
      .single()

    if (adminError || !admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isSuperAdmin = admin.role === "super_admin" || admin.role === "god"

    // Build queries with org filtering for non-super admins
    let studentsQuery = supabase
      .from("students")
      .select("full_name, email, city, state, country, gender")

    let assessmentsQuery = supabase
      .from("assessments")
      .select("basic_info, personality, family_context")
      .or('is_demo.is.null,is_demo.eq.false')

    if (!isSuperAdmin) {
      studentsQuery = studentsQuery.eq("organization_id", admin.organization_id)
      assessmentsQuery = assessmentsQuery.eq("organization_id", admin.organization_id)
    }

    const { data: students, error: studentsError } = await studentsQuery
    const { data: assessments, error: assessmentsError } = await assessmentsQuery

    if (studentsError) {
      console.error("Students demographics fetch error:", studentsError)
      return NextResponse.json({ error: "Failed to fetch student demographics" }, { status: 500 })
    }

    if (assessmentsError) {
      console.error("Assessments demographics fetch error:", assessmentsError)
      return NextResponse.json({ error: "Failed to fetch assessment demographics" }, { status: 500 })
    }

    // Combine data from students table and assessments basic_info
    const allData = [
      ...(students || []).map(s => ({
        fullName: s.full_name,
        email: s.email,
        state: s.state,
        country: s.country,
        gender: s.gender
      })),
      ...(assessments || []).map(a => {
        const bi = (a.basic_info as Record<string, unknown>) || {}
        return {
          fullName: bi.fullName as string | null || null,
          email: bi.email as string | null || null,
          state: bi.state as string | null || null,
          country: bi.country as string | null || null,
          gender: bi.gender as string | null || (a.personality as Record<string, unknown>)?.gender as string | null || (a.family_context as Record<string, unknown>)?.gender as string | null || null
        }
      })
    ]

    const normalizeCountry = (c: string) => {
      const clean = c.trim().toLowerCase()
      if (["usa", "u.s.a.", "united states of america", "united states", "us", "u.s."].includes(clean)) return "United States"
      if (["uk", "u.k.", "united kingdom", "britain"].includes(clean)) return "United Kingdom"
      if (["uae", "u.a.e.", "united arab emirates"].includes(clean)) return "United Arab Emirates"
      if (clean === "india") return "India"
      if (clean === "canada") return "Canada"
      return c.trim()
    }

    const normalizeGender = (g: string) => {
      const clean = g.trim().toLowerCase()
      if (clean === "m" || clean === "male") return "Male"
      if (clean === "f" || clean === "female") return "Female"
      if (clean === "o" || clean === "other") return "Other"
      if (clean === "d") return "Diverse"
      return g.trim()
    }

    // Aggregate location data with student lists (using Sets for O(1) dedup)
    const locationMap = new Map<string, { count: number, students: { name: string, email: string }[], seen: Set<string> }>()
    const countryMap = new Map<string, { count: number, students: { name: string, email: string }[], seen: Set<string> }>()
    const genderMap = new Map<string, number>()

    allData.forEach(item => {
      const studentInfo = item.fullName && item.email ? { name: item.fullName, email: item.email } : null

      const state = item.state?.trim()
      if (state && state !== "") {
        const current = locationMap.get(state) || { count: 0, students: [], seen: new Set() }
        current.count++
        if (studentInfo && !current.seen.has(studentInfo.email)) {
          current.seen.add(studentInfo.email)
          current.students.push(studentInfo)
        }
        locationMap.set(state, current)
      }

      const country = item.country?.trim()
      if (country && country !== "") {
        const normalizedCountry = normalizeCountry(country)
        const current = countryMap.get(normalizedCountry) || { count: 0, students: [], seen: new Set() }
        current.count++
        if (studentInfo && !current.seen.has(studentInfo.email)) {
          current.seen.add(studentInfo.email)
          current.students.push(studentInfo)
        }
        countryMap.set(normalizedCountry, current)
      }

      const gender = item.gender?.trim()
      const genderKey = gender && gender !== "" ? normalizeGender(gender) : "Not Specified"
      genderMap.set(genderKey, (genderMap.get(genderKey) || 0) + 1)
    })

    return NextResponse.json({
      success: true,
      data: {
        locations: Array.from(locationMap.entries()).map(([name, { count, students }]) => ({
          name,
          value: count,
          students
        })).sort((a, b) => b.value - a.value),
        genders: Array.from(genderMap.entries()).map(([name, value]) => ({ name, value })),
        countries: Array.from(countryMap.entries()).map(([name, { count, students }]) => ({
          name,
          value: count,
          students
        })).sort((a, b) => b.value - a.value)
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error("Demographics error:", error)
    return NextResponse.json({ error: "Failed to fetch demographics" }, { status: 500 })
  }
}
