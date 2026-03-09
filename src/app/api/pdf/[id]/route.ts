import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = createServerSupabaseClient()

    const { data: assessment, error } = await supabase
      .from('assessments')
      .select(`
        *,
        students (*)
      `)
      .eq('id', id)
      .single()

    if (error || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    if (!assessment.responses) {
      return NextResponse.json({ error: 'Assessment data is incomplete' }, { status: 400 })
    }

      const pdf = new jsPDF('p', 'mm', 'a4') as JsPDFWithAutoTable
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 22
      const contentWidth = pageWidth - margin * 2
      let yPos = 20

      const navy = '#1e3a5f'
      const gold = '#c9a227'
      const gray = '#5a7a9a'
      const lightBg = '#faf8f3'

      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - 35) {
          addFooter()
          pdf.addPage()
          yPos = 30
          return true
        }
        return false
      }

      const addFooter = () => {
        const footerY = pageHeight - 18
        pdf.setDrawColor(229, 224, 213)
        pdf.setLineWidth(0.3)
        pdf.line(margin, footerY - 8, pageWidth - margin, footerY - 8)
        pdf.setTextColor(201, 162, 39)
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Student Blueprint', margin, footerY)
        pdf.setTextColor(120, 140, 160)
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Page ${pdf.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' })
      }

      const addPageHeader = (title: string) => {
        pdf.setFillColor(30, 58, 95)
        pdf.rect(0, 0, pageWidth, 40, 'F')
        pdf.setTextColor(201, 162, 39)
        pdf.setFontSize(20)
        pdf.setFont('helvetica', 'bold')
        pdf.text(title, pageWidth / 2, 25, { align: 'center' })
        yPos = 55
      }

      const addSectionHeader = (title: string, icon?: string) => {
        addNewPageIfNeeded(30)
        yPos += 5
        pdf.setFillColor(30, 58, 95)
        pdf.rect(margin, yPos, 5, 14, 'F')
        pdf.setTextColor(30, 58, 95)
        pdf.setFontSize(15)
        pdf.setFont('helvetica', 'bold')
        pdf.text(title.toUpperCase(), margin + 10, yPos + 10)
        yPos += 22
      }

      const addSubsectionHeader = (title: string, color: string = gray) => {
        addNewPageIfNeeded(20)
        yPos += 3
        const hex = color.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        pdf.setTextColor(r, g, b)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(title, margin, yPos)
        yPos += 10
      }

          const addBulletPoints = (items: string[] | undefined, maxItems = 20) => {
            if (!items || items.length === 0) return
            pdf.setTextColor(90, 122, 154)
            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'normal')
            items.slice(0, maxItems).forEach((item) => {
              const lines = pdf.splitTextToSize(item, contentWidth - 12)
              const requiredHeight = lines.length * 5.5 + 4
              addNewPageIfNeeded(requiredHeight + 8)
              pdf.setFillColor(201, 162, 39)
              pdf.circle(margin + 3, yPos - 1.5, 1.8, 'F')
              pdf.text(lines, margin + 8, yPos)
              yPos += requiredHeight
            })
            yPos += 4
          }

          const addParagraph = (text: string | undefined) => {
            if (!text) return
            pdf.setTextColor(90, 122, 154)
            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'normal')
            const lines = pdf.splitTextToSize(text, contentWidth - 4)
            const requiredHeight = lines.length * 5.5 + 8
            addNewPageIfNeeded(requiredHeight + 10)
            pdf.text(lines, margin, yPos)
            yPos += requiredHeight
          }

      const studentRaw = assessment.students
      const student = Array.isArray(studentRaw) ? studentRaw[0] : (studentRaw ?? null)
      const responses = (assessment.responses || {}) as Record<string, Record<string, unknown>>
      const basicInfo = responses.basicInfo || assessment.basic_info || {}
      const studentName = String(
        student?.full_name || student?.first_name || student?.email ||
        (basicInfo as Record<string, unknown>)?.fullName || 'Student'
      )

      pdf.setFillColor(30, 58, 95)
      pdf.rect(0, 0, pageWidth, 80, 'F')

      pdf.setTextColor(201, 162, 39)
      pdf.setFontSize(36)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Student Blueprint', pageWidth / 2, 35, { align: 'center' })

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Launchpad Success Plan', pageWidth / 2, 50, { align: 'center' })

      pdf.setFontSize(10)
      pdf.setTextColor(220, 220, 220)
      pdf.text(`Prepared for ${studentName}`, pageWidth / 2, 64, { align: 'center' })
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, pageWidth / 2, 72, { align: 'center' })

      yPos = 95

      pdf.setFillColor(250, 248, 243)
      pdf.roundedRect(margin, yPos, contentWidth, 52, 4, 4, 'F')
      pdf.setDrawColor(201, 162, 39)
      pdf.setLineWidth(1.2)
      pdf.roundedRect(margin, yPos, contentWidth, 52, 4, 4, 'S')

      pdf.setTextColor(90, 122, 154)
      pdf.setFontSize(10)
      pdf.text('STUDENT PROFILE', pageWidth / 2, yPos + 10, { align: 'center' })

      pdf.setTextColor(30, 58, 95)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text(studentName, pageWidth / 2, yPos + 26, { align: 'center' })

        if (assessment.student_archetype) {
          const archetypeLines = pdf.splitTextToSize(assessment.student_archetype, contentWidth - 40)
          const archetypeText = archetypeLines[0]
          pdf.setFillColor(201, 162, 39)
          const archetypeWidth = Math.min(pdf.getTextWidth(archetypeText) + 20, contentWidth - 20)
          pdf.roundedRect((pageWidth - archetypeWidth) / 2, yPos + 34, archetypeWidth, 12, 3, 3, 'F')
          pdf.setTextColor(30, 58, 95)
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'bold')
          pdf.text(archetypeText, pageWidth / 2, yPos + 42, { align: 'center' })
        }

      yPos += 62

      pdf.setTextColor(90, 122, 154)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
        const bi = basicInfo as Record<string, unknown>
        const infoItems = [
          { label: 'Grade', value: bi?.currentGrade || student?.current_grade || 'N/A' },
          { label: 'School', value: bi?.schoolName || 'N/A' },
          { label: 'Target Year', value: bi?.targetCollegeYear || student?.target_college_year || 'N/A' },
          { label: 'Location', value: [bi?.city, bi?.state, bi?.country].filter(Boolean).join(', ') || 'N/A' }
        ]

        infoItems.forEach((item, i) => {
          const xPos = margin + (i % 2) * (contentWidth / 2)
          const yOffset = Math.floor(i / 2) * 14
          pdf.setFont('helvetica', 'bold')
          pdf.text(`${item.label}: `, xPos, yPos + yOffset)
          pdf.setFont('helvetica', 'normal')
          const valueStr = String(item.value ?? 'N/A')
          const valueLines = pdf.splitTextToSize(valueStr, contentWidth / 2 - 30)
          pdf.text(valueLines.slice(0, 1), xPos + pdf.getTextWidth(`${item.label}: `), yPos + yOffset)
        })

      yPos += 40

      pdf.setFillColor(30, 58, 95)
      pdf.roundedRect(margin, yPos, contentWidth, 68, 4, 4, 'F')
      pdf.setTextColor(201, 162, 39)
      pdf.setFontSize(13)
      pdf.setFont('helvetica', 'bold')
      pdf.text('What This Report Contains', margin + 12, yPos + 14)
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(9.5)
      pdf.setFont('helvetica', 'normal')
        const tocItems = [
          '1. Executive Summary & Student Archetype',
          '2. Strengths Analysis & Competitive Advantages',
          '3. Gap Analysis & Areas for Development',
          '4. Personalized Roadmap (Immediate to Long-term)',
          '5. Career & Future Recommendations',
          '6. College Match & Success Strategy',
          '7. Academic Course Recommendations',
          '8. SAT/ACT Goals & Test Prep Strategy',
          '9. Research & Publications Recommendations',
          '10. Leadership Development Plan',
          '11. Network & Mentorship Targets',
          '12. Summer Programs & Ivy League Opportunities',
          '13. Competitions, Sports & Extracurricular Activities',
          '14. Passion Project Ideas',
          '15. Internship Opportunities'
        ]
        tocItems.forEach((item, i) => {
          const col = Math.floor(i / 8)
          const row = i % 8
          pdf.text(item, margin + 12 + col * 88, yPos + 22 + row * 6)
        })

    addFooter()

    pdf.addPage()
    addPageHeader('Executive Summary')

      addSectionHeader('Your Student Archetype')
      if (assessment.student_archetype) {
        pdf.setFillColor(254, 249, 231)
        pdf.roundedRect(margin, yPos, contentWidth, 24, 4, 4, 'F')
        pdf.setDrawColor(201, 162, 39)
        pdf.setLineWidth(1.2)
        pdf.roundedRect(margin, yPos, contentWidth, 24, 4, 4, 'S')
        pdf.setTextColor(30, 58, 95)
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text(assessment.student_archetype, pageWidth / 2, yPos + 16, { align: 'center' })
        yPos += 32
      }

      addParagraph('Based on comprehensive analysis of your academic profile, extracurricular activities, passions, and personality traits, we have identified your unique archetype. This archetype guides all the personalized recommendations throughout this report.')

      if (assessment.archetype_scores && typeof assessment.archetype_scores === 'object') {
        addSectionHeader('Personality Archetype Analysis')

        addParagraph('Your unique personality profile across 8 dimensions')

        const scores = assessment.archetype_scores
        const chartData = [
          { name: 'Visionary', value: Number(scores?.Visionary) || 0 },
          { name: 'Builder', value: Number(scores?.Builder) || 0 },
          { name: 'Healer', value: Number(scores?.Healer) || 0 },
          { name: 'Analyst', value: Number(scores?.Analyst) || 0 },
          { name: 'Artist', value: Number(scores?.Artist) || 0 },
          { name: 'Advocate', value: Number(scores?.Advocate) || 0 },
          { name: 'Entrepreneur', value: Number(scores?.Entrepreneur) || 0 },
          { name: 'Researcher', value: Number(scores?.Researcher) || 0 }
        ]
        
        addNewPageIfNeeded(120)
        
        const centerX = pageWidth / 2
        const centerY = yPos + 55
        const radius = 45
        const maxScore = 100
        
        pdf.setDrawColor(229, 224, 213)
        pdf.setLineWidth(0.3)
        const gridLevels = [25, 50, 75, 100]
        gridLevels.forEach(level => {
          const r = (radius * level) / maxScore
          pdf.circle(centerX, centerY, r, 'S')
        })
        
        const angleStep = (2 * Math.PI) / 8
        chartData.forEach((item, i) => {
          const angle = i * angleStep - Math.PI / 2
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)
          pdf.line(centerX, centerY, x, y)
        })
        
        pdf.setFillColor(201, 162, 39, 0.3)
        pdf.setDrawColor(201, 162, 39)
        pdf.setLineWidth(1.5)
        const points: Array<[number, number]> = []
        chartData.forEach((item, i) => {
          const angle = i * angleStep - Math.PI / 2
          const r = (radius * item.value) / maxScore
          const x = centerX + r * Math.cos(angle)
          const y = centerY + r * Math.sin(angle)
          points.push([x, y])
        })
        
        if (points.length > 0) {
          pdf.moveTo(points[0][0], points[0][1])
          for (let i = 1; i < points.length; i++) {
            pdf.lineTo(points[i][0], points[i][1])
          }
          pdf.lineTo(points[0][0], points[0][1])
          pdf.fill()
          
          pdf.moveTo(points[0][0], points[0][1])
          for (let i = 1; i < points.length; i++) {
            pdf.lineTo(points[i][0], points[i][1])
          }
          pdf.lineTo(points[0][0], points[0][1])
          pdf.stroke()
        }
        
        pdf.setTextColor(90, 122, 154)
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        chartData.forEach((item, i) => {
          const angle = i * angleStep - Math.PI / 2
          const labelRadius = radius + 15
          const x = centerX + labelRadius * Math.cos(angle)
          const y = centerY + labelRadius * Math.sin(angle)
          pdf.text(item.name, x, y, { align: 'center' })
          
          const scoreY = y + 5
          pdf.setFontSize(8)
          pdf.setTextColor(201, 162, 39)
          pdf.setFont('helvetica', 'bold')
          pdf.text(item.value.toString(), x, scoreY, { align: 'center' })
          pdf.setTextColor(90, 122, 154)
          pdf.setFont('helvetica', 'normal')
        })
        
        yPos += 120
      }

      if (assessment.report_data?.generationFailed) {
        addNewPageIfNeeded(30)
        pdf.setFillColor(254, 243, 199)
        pdf.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'F')
        pdf.setDrawColor(245, 158, 11)
        pdf.setLineWidth(0.8)
        pdf.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'S')
        pdf.setTextColor(146, 64, 14)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Report analysis is pending - please regenerate', pageWidth / 2, yPos + 13, { align: 'center' })
        yPos += 28
      }

      if (assessment.strengths_analysis) {
        addSectionHeader('Strengths Analysis')

        if (Array.isArray(assessment.strengths_analysis?.competitiveAdvantages) && assessment.strengths_analysis.competitiveAdvantages.length) {
          addSubsectionHeader('Competitive Advantages', '#10b981')
          addBulletPoints(assessment.strengths_analysis.competitiveAdvantages)
        }

        if (Array.isArray(assessment.strengths_analysis?.uniqueDifferentiators) && assessment.strengths_analysis.uniqueDifferentiators.length) {
          addSubsectionHeader('What Makes You Stand Out', '#6366f1')
          addBulletPoints(assessment.strengths_analysis.uniqueDifferentiators)
        }

        if (Array.isArray(assessment.strengths_analysis?.alignedActivities) && assessment.strengths_analysis.alignedActivities.length) {
          addSubsectionHeader('Activities Aligned with Your Goals', '#f59e0b')
          addBulletPoints(assessment.strengths_analysis.alignedActivities)
        }
      }

    if (assessment.gap_analysis) {
      addFooter()
      pdf.addPage()
      addPageHeader('Gap Analysis')

      addParagraph('Understanding areas for growth is just as important as recognizing strengths. The following analysis identifies opportunities to strengthen your college application profile.')

      if (Array.isArray(assessment.gap_analysis?.missingElements) && assessment.gap_analysis.missingElements.length) {
        addSubsectionHeader('Missing Elements to Address', '#ef4444')
        addBulletPoints(assessment.gap_analysis.missingElements)
      }

      if (Array.isArray(assessment.gap_analysis?.activitiesToDeepen) && assessment.gap_analysis.activitiesToDeepen.length) {
        addSubsectionHeader('Activities to Deepen', '#f59e0b')
        addBulletPoints(assessment.gap_analysis.activitiesToDeepen)
      }

      if (Array.isArray(assessment.gap_analysis?.skillsToDevelope) && assessment.gap_analysis.skillsToDevelope.length) {
        addSubsectionHeader('Skills to Develop', '#3b82f6')
        addBulletPoints(assessment.gap_analysis.skillsToDevelope)
      }
    }

    if (assessment.roadmap_data) {
      addFooter()
      pdf.addPage()
      addPageHeader('Your Personalized Roadmap')

      addParagraph('This roadmap provides a structured timeline for achieving your college preparation goals. Each phase builds upon the previous one to create a compelling narrative for admissions.')

        const roadmap = assessment.roadmap_data
        const timeframes = [
          { key: 'immediate', label: 'Immediate Actions (Next 3 Months)', color: '#10b981', description: 'Start these activities right away to build momentum.' },
          { key: 'shortTerm', label: 'Short-Term Goals (3-6 Months)', color: '#f59e0b', description: 'Develop these areas over the next semester.' },
          { key: 'mediumTerm', label: 'Medium-Term Projects (6-12 Months)', color: '#6366f1', description: 'Tackle these substantial projects over the coming year.' },
          { key: 'longTerm', label: 'Long-Term Trajectory (1+ Years)', color: '#ec4899', description: 'Keep these long-term goals in mind as you plan ahead.' }
        ]

        timeframes.forEach(({ key, label, color, description }) => {
          const items = roadmap[key as keyof typeof roadmap] as string[]
          if (items?.length) {
            addNewPageIfNeeded(45)
            
            const hex = color.replace('#', '')
            const r = parseInt(hex.substring(0, 2), 16)
            const g = parseInt(hex.substring(2, 4), 16)
            const b = parseInt(hex.substring(4, 6), 16)
            
            pdf.setFillColor(r, g, b)
            pdf.roundedRect(margin, yPos, contentWidth, 12, 3, 3, 'F')
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(12)
            pdf.setFont('helvetica', 'bold')
            pdf.text(label, margin + 8, yPos + 8)
            yPos += 18

            pdf.setTextColor(90, 122, 154)
            pdf.setFontSize(9.5)
            pdf.setFont('helvetica', 'italic')
            pdf.text(description, margin, yPos)
            yPos += 10

            addBulletPoints(items)
            yPos += 6
          }
          })
      }

      if (assessment.grade_by_grade_roadmap) {
        addFooter()
        pdf.addPage()
        addPageHeader('Multi-Year Roadmap Through 12th Grade')

        addParagraph('This comprehensive roadmap outlines your academic and extracurricular strategy year by year, ensuring you build a competitive profile for college admissions.')

        const gradeRoadmap = assessment.grade_by_grade_roadmap

        if (gradeRoadmap.currentGrade) {
          const grade = gradeRoadmap.currentGrade
          addNewPageIfNeeded(55)
          
          pdf.setFillColor(30, 58, 95)
          pdf.roundedRect(margin, yPos, contentWidth, 12, 3, 3, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`${grade.grade} (Current Year) - ${grade.focus}`, margin + 8, yPos + 8)
          yPos += 18

          if (grade.academics?.length) {
            addSubsectionHeader('Academic Goals', '#6366f1')
            addBulletPoints(grade.academics)
          }
          if (grade.extracurriculars?.length) {
            addSubsectionHeader('Extracurricular Actions', '#10b981')
            addBulletPoints(grade.extracurriculars)
          }
          if (grade.testing?.length) {
            addSubsectionHeader('Testing Milestones', '#f59e0b')
            addBulletPoints(grade.testing)
          }
          if (grade.leadership?.length) {
            addSubsectionHeader('Leadership Opportunities', '#ec4899')
            addBulletPoints(grade.leadership)
          }
          if (grade.summerPlan) {
            addSubsectionHeader('Summer Plan', '#8b5cf6')
            addParagraph(grade.summerPlan)
          }
          yPos += 8
        }

        if (gradeRoadmap.nextYears && Array.isArray(gradeRoadmap.nextYears)) {
          gradeRoadmap.nextYears.forEach((grade: { 
            grade: string, 
            focus: string, 
            academics?: string[], 
            extracurriculars?: string[], 
            testing?: string[], 
            leadership?: string[], 
            summerPlan?: string 
          }, index: number) => {
            addNewPageIfNeeded(55)
            
            pdf.setFillColor(90, 122, 154)
            pdf.roundedRect(margin, yPos, contentWidth, 12, 3, 3, 'F')
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(12)
            pdf.setFont('helvetica', 'bold')
            pdf.text(`${grade.grade} - ${grade.focus}`, margin + 8, yPos + 8)
            yPos += 18

            if (grade.academics?.length) {
              addSubsectionHeader('Academic Goals', '#6366f1')
              addBulletPoints(grade.academics)
            }
            if (grade.extracurriculars?.length) {
              addSubsectionHeader('Extracurricular Actions', '#10b981')
              addBulletPoints(grade.extracurriculars)
            }
            if (grade.testing?.length) {
              addSubsectionHeader('Testing Milestones', '#f59e0b')
              addBulletPoints(grade.testing)
            }
            if (grade.leadership?.length) {
              addSubsectionHeader('Leadership Opportunities', '#ec4899')
              addBulletPoints(grade.leadership)
            }
            if (grade.summerPlan) {
              addSubsectionHeader('Summer Plan', '#8b5cf6')
              addParagraph(grade.summerPlan)
            }
            yPos += 8
          })
        }
      }

      if (assessment.career_recommendations) {
        addFooter()
        pdf.addPage()
        addPageHeader('Career & Future Recommendations')

        const career = assessment.career_recommendations

        if (career.linkedInBioHeadline) {
          addSubsectionHeader('LinkedIn Bio Headline', '#0a66c2')
          pdf.setFillColor(240, 244, 248)
          const lines = pdf.splitTextToSize(`"${career.linkedInBioHeadline}"`, contentWidth - 20)
          pdf.roundedRect(margin, yPos, contentWidth, lines.length * 6 + 10, 3, 3, 'F')
          pdf.setTextColor(30, 58, 95)
          pdf.setFont('helvetica', 'italic')
          pdf.text(lines, margin + 10, yPos + 8)
          yPos += lines.length * 6 + 15
        }

        if (career.jobTitles?.length) {
          addSubsectionHeader('Recommended Job Titles', '#1e3a5f')
          addBulletPoints(career.jobTitles)
        }

        if (career.salaryPotential) {
          addSubsectionHeader('Salary Potential', '#10b981')
          addParagraph(career.salaryPotential)
        }

        if (career.blueOceanIndustries?.length) {
          addSubsectionHeader('Blue Ocean Industries', '#c9a227')
          career.blueOceanIndustries.forEach((industry: { industry: string, why: string }) => {
            addNewPageIfNeeded(30)
            pdf.setFont('helvetica', 'bold')
            pdf.setTextColor(30, 58, 95)
            pdf.text(industry.industry, margin, yPos)
            yPos += 6
            addParagraph(industry.why)
            yPos += 2
          })
        }
      }

      if (assessment.college_recommendations) {
        addFooter()
        pdf.addPage()
        addPageHeader('College Match & Success Strategy')

        const college = assessment.college_recommendations

        if (college.collegeBreakdown) {
          const { reach, target, safety } = college.collegeBreakdown
          
          if (reach?.length) {
            addSubsectionHeader('Reach Schools', '#ef4444')
            addBulletPoints(reach)
          }
          if (target?.length) {
            addSubsectionHeader('Target Schools', '#3b82f6')
            addBulletPoints(target)
          }
          if (safety?.length) {
            addSubsectionHeader('Safety Schools', '#10b981')
            addBulletPoints(safety)
          }
        }

        if (college.schoolMatches?.length) {
          addSectionHeader('Deep Match Analysis')
          college.schoolMatches.forEach((match: { schoolName: string, matchScore: number, why: string }) => {
            addNewPageIfNeeded(40)
            pdf.setFillColor(250, 248, 243)
            pdf.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F')
            
            pdf.setTextColor(30, 58, 95)
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(12)
            pdf.text(match.schoolName, margin + 8, yPos + 10)
            
            pdf.setTextColor(201, 162, 39)
            pdf.text(`${match.matchScore}% Match`, pageWidth - margin - 35, yPos + 10)
            
            yPos += 16
            pdf.setTextColor(90, 122, 154)
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(9)
            const whyLines = pdf.splitTextToSize(`Why? ${match.why}`, contentWidth - 16)
            pdf.text(whyLines, margin + 8, yPos)
            yPos += whyLines.length * 5 + 10
          })
        }
      }

      if (assessment.academic_courses_recommendations) {
        addFooter()
        pdf.addPage()
        addPageHeader('Academic Recommendations')

      const courses = assessment.academic_courses_recommendations

      if (courses.apCourses?.length) {
        addSubsectionHeader('Recommended AP Courses', '#6366f1')
        addBulletPoints(courses.apCourses)
      }

      if (courses.ibCourses?.length) {
        addSubsectionHeader('Recommended IB Courses', '#8b5cf6')
        addBulletPoints(courses.ibCourses)
      }

      if (courses.honorsCourses?.length) {
        addSubsectionHeader('Recommended Honors Courses', '#ec4899')
        addBulletPoints(courses.honorsCourses)
      }

      if (courses.electivesRecommended?.length) {
        addSubsectionHeader('Strategic Electives', '#f59e0b')
        addBulletPoints(courses.electivesRecommended)
      }

      const academicProfile = assessment.academic_profile || {}
      const testingInfo = assessment.testing_info || {}

        if (academicProfile.gpaUnweighted || testingInfo.satScore || testingInfo.actScore) {
          addNewPageIfNeeded(65)
          addSectionHeader('Current Academic Profile')

          const academicData = []
          if (academicProfile.gpaUnweighted) academicData.push(['GPA (Unweighted)', academicProfile.gpaUnweighted])
          if (academicProfile.gpaWeighted) academicData.push(['GPA (Weighted)', academicProfile.gpaWeighted])
          if (academicProfile.classRank) academicData.push(['Class Rank', academicProfile.classRank])
          if (testingInfo.satScore) academicData.push(['Current SAT', testingInfo.satScore])
          if (testingInfo.actScore) academicData.push(['Current ACT', testingInfo.actScore])
          if (testingInfo.psatScore) academicData.push(['PSAT Score', testingInfo.psatScore])

          if (academicData.length > 0) {
            autoTable(pdf, {
              startY: yPos,
              head: [['Metric', 'Value']],
              body: academicData,
              theme: 'striped',
              headStyles: { 
                fillColor: [30, 58, 95], 
                textColor: [255, 255, 255], 
                fontStyle: 'bold',
                fontSize: 11
              },
              styles: { 
                fontSize: 10, 
                cellPadding: 6,
                lineColor: [229, 224, 213],
                lineWidth: 0.3
              },
              alternateRowStyles: { fillColor: [250, 248, 243] },
              margin: { left: margin, right: margin }
            })
            yPos = (pdf as JsPDFWithAutoTable).lastAutoTable?.finalY ?? yPos + 40
            yPos += 12
          }
        }
    }

    if (assessment.sat_act_goals) {
      addFooter()
      pdf.addPage()
      addPageHeader('SAT/ACT Goals & Strategy')

        const goals = assessment.sat_act_goals || {} as Record<string, unknown>

        pdf.setFillColor(250, 248, 243)
        pdf.roundedRect(margin, yPos, contentWidth / 2 - 6, 56, 4, 4, 'F')
        pdf.setDrawColor(201, 162, 39)
        pdf.setLineWidth(0.5)
        pdf.roundedRect(margin, yPos, contentWidth / 2 - 6, 56, 4, 4, 'S')
        
        pdf.roundedRect(margin + contentWidth / 2 + 6, yPos, contentWidth / 2 - 6, 56, 4, 4, 'F')
        pdf.roundedRect(margin + contentWidth / 2 + 6, yPos, contentWidth / 2 - 6, 56, 4, 4, 'S')

        pdf.setTextColor(30, 58, 95)
        pdf.setFontSize(13)
        pdf.setFont('helvetica', 'bold')
        pdf.text('SAT Target', margin + contentWidth / 4 - 3, yPos + 14, { align: 'center' })
        pdf.setFontSize(28)
        pdf.setTextColor(201, 162, 39)
        pdf.text(goals.targetSATScore || 'N/A', margin + contentWidth / 4 - 3, yPos + 32, { align: 'center' })

        pdf.setTextColor(30, 58, 95)
        pdf.setFontSize(13)
        pdf.setFont('helvetica', 'bold')
        pdf.text('ACT Target', margin + 3 * contentWidth / 4 + 3, yPos + 14, { align: 'center' })
        pdf.setFontSize(28)
        pdf.setTextColor(201, 162, 39)
        pdf.text(goals.targetACTScore || 'N/A', margin + 3 * contentWidth / 4 + 3, yPos + 32, { align: 'center' })

        if (goals.satSectionGoals) {
          pdf.setFontSize(8.5)
          pdf.setTextColor(90, 122, 154)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`R: ${goals.satSectionGoals.reading || 'N/A'} | W: ${goals.satSectionGoals.writing || 'N/A'} | M: ${goals.satSectionGoals.math || 'N/A'}`, margin + contentWidth / 4 - 3, yPos + 46, { align: 'center' })
        }

        if (goals.actSectionGoals) {
          pdf.setFontSize(8.5)
          pdf.text(`E: ${goals.actSectionGoals.english || 'N/A'} | M: ${goals.actSectionGoals.math || 'N/A'} | R: ${goals.actSectionGoals.reading || 'N/A'} | S: ${goals.actSectionGoals.science || 'N/A'}`, margin + 3 * contentWidth / 4 + 3, yPos + 46, { align: 'center' })
        }

        yPos += 68

      addSubsectionHeader('Preparation Strategy', '#3b82f6')
      addParagraph(goals.prepStrategy)

      addSubsectionHeader('Recommended Timeline', '#10b981')
      addParagraph(goals.timeline)
    }

    if (assessment.research_publications_recommendations) {
      addFooter()
      pdf.addPage()
      addPageHeader('Research & Publications')

      const research = assessment.research_publications_recommendations

      addParagraph('Research experience demonstrates intellectual curiosity and the ability to contribute to your field. Here are personalized recommendations based on your interests and goals.')

      if (research.researchTopics?.length) {
        addSubsectionHeader('Recommended Research Topics', '#06b6d4')
        addBulletPoints(research.researchTopics)
      }

      if (research.publicationOpportunities?.length) {
        addSubsectionHeader('Publication Opportunities', '#8b5cf6')
        addBulletPoints(research.publicationOpportunities)
      }

      if (research.mentorshipSuggestions?.length) {
        addSubsectionHeader('Finding Mentors', '#f59e0b')
        addBulletPoints(research.mentorshipSuggestions)
      }

      if (research.timeline) {
        addSubsectionHeader('Research Timeline', '#10b981')
        addParagraph(research.timeline)
      }
    }

    if (assessment.leadership_recommendations) {
      addFooter()
      pdf.addPage()
      addPageHeader('Leadership Development')

      const leadership = assessment.leadership_recommendations

      addParagraph('Leadership positions demonstrate your ability to inspire others, manage projects, and create positive change. The following recommendations are tailored to your personality and interests.')

      if (leadership.clubLeadership?.length) {
        addSubsectionHeader('Club Leadership Opportunities', '#6366f1')
        addBulletPoints(leadership.clubLeadership)
      }

      if (leadership.schoolWideRoles?.length) {
        addSubsectionHeader('School-Wide Roles', '#ec4899')
        addBulletPoints(leadership.schoolWideRoles)
      }

      if (leadership.communityLeadership?.length) {
        addSubsectionHeader('Community Leadership', '#10b981')
        addBulletPoints(leadership.communityLeadership)
      }

      if (leadership.leadershipDevelopment?.length) {
        addSubsectionHeader('Leadership Development Activities', '#f59e0b')
        addBulletPoints(leadership.leadershipDevelopment)
      }
    }

    if (assessment.student_government_recommendations) {
      addNewPageIfNeeded(80)
      addSectionHeader('Student Government')

      const gov = assessment.student_government_recommendations

      if (gov.schoolGovernment?.length) {
        addSubsectionHeader('School Government', '#8b5cf6')
        addBulletPoints(gov.schoolGovernment)
      }

      if (gov.districtStateRoles?.length) {
        addSubsectionHeader('District/State Roles', '#3b82f6')
        addBulletPoints(gov.districtStateRoles)
      }

      if (gov.youthGovernment?.length) {
        addSubsectionHeader('Youth Government Programs', '#10b981')
        addBulletPoints(gov.youthGovernment)
      }

      if (gov.advocacyRoles?.length) {
        addSubsectionHeader('Advocacy Roles', '#ef4444')
        addBulletPoints(gov.advocacyRoles)
      }
    }

        if (assessment.mentor_recommendations) {
          addFooter()
          pdf.addPage()
          addPageHeader('Network & Mentorship Targets')
  
          const network = assessment.mentor_recommendations
  
          if (network.mentors?.length) {
            network.mentors.forEach((mentor: { name: string, university: string, department: string, why: string, coldEmailTemplate?: string }) => {
              addNewPageIfNeeded(50)
              pdf.setFillColor(248, 246, 241)
              pdf.roundedRect(margin, yPos, contentWidth, 45, 3, 3, 'F')
              
              pdf.setTextColor(30, 58, 95)
              pdf.setFont('helvetica', 'bold')
              pdf.setFontSize(12)
              pdf.text(mentor.name, margin + 8, yPos + 10)
              
              pdf.setTextColor(90, 122, 154)
              pdf.setFontSize(10)
              pdf.text(`${mentor.university} - ${mentor.department}`, margin + 8, yPos + 16)
              
              yPos += 22
              pdf.setTextColor(30, 58, 95)
              pdf.setFont('helvetica', 'normal')
              pdf.setFontSize(9)
              const whyLines = pdf.splitTextToSize(`Alignment: ${mentor.why}`, contentWidth - 16)
              pdf.text(whyLines, margin + 8, yPos)
              yPos += whyLines.length * 5 + 6

              if (mentor.coldEmailTemplate) {
                pdf.setFont('helvetica', 'bold')
                pdf.text('Outreach template available in digital portal.', margin + 8, yPos)
                yPos += 6
              }
              
              yPos += 4
            })
          }
        }

      if (assessment.summer_ivy_programs_recommendations) {
      addFooter()
      pdf.addPage()
      addPageHeader('Summer & Ivy Programs')

      const summer = assessment.summer_ivy_programs_recommendations

      addParagraph('Summer programs offer unparalleled opportunities to explore academic interests, build skills, and demonstrate commitment to your field. Selective programs are particularly impressive to admissions officers.')

      if (summer.preFreshmanPrograms?.length) {
        addSubsectionHeader('Pre-Freshman/Introductory Programs', '#6366f1')
        addBulletPoints(summer.preFreshmanPrograms)
      }

      if (summer.competitivePrograms?.length) {
        addSubsectionHeader('Competitive Summer Programs', '#ef4444')
        addBulletPoints(summer.competitivePrograms)
      }

      if (summer.researchPrograms?.length) {
        addSubsectionHeader('Research Programs', '#06b6d4')
        addBulletPoints(summer.researchPrograms)
      }

      if (summer.enrichmentPrograms?.length) {
        addSubsectionHeader('Enrichment Programs', '#10b981')
        addBulletPoints(summer.enrichmentPrograms)
      }
    }

    if (assessment.service_community_recommendations) {
      addNewPageIfNeeded(80)
      addSectionHeader('Service & Community')

      const service = assessment.service_community_recommendations

      if (service.localOpportunities?.length) {
        addSubsectionHeader('Local Opportunities', '#10b981')
        addBulletPoints(service.localOpportunities)
      }

      if (service.nationalPrograms?.length) {
        addSubsectionHeader('National Programs', '#3b82f6')
        addBulletPoints(service.nationalPrograms)
      }

      if (service.internationalService?.length) {
        addSubsectionHeader('International Service', '#8b5cf6')
        addBulletPoints(service.internationalService)
      }

      if (service.sustainedCommitment?.length) {
        addSubsectionHeader('Building Sustained Commitment', '#f59e0b')
        addBulletPoints(service.sustainedCommitment)
      }
    }

    if (assessment.sports_recommendations || assessment.competitions_recommendations) {
      addFooter()
      pdf.addPage()
      addPageHeader('Athletics & Competitions')

      if (assessment.sports_recommendations) {
        const sports = assessment.sports_recommendations

        addSectionHeader('Sports Recommendations')

        if (sports.varsitySports?.length) {
          addSubsectionHeader('Varsity Sports', '#ef4444')
          addBulletPoints(sports.varsitySports)
        }

        if (sports.clubSports?.length) {
          addSubsectionHeader('Club Sports', '#f59e0b')
          addBulletPoints(sports.clubSports)
        }

        if (sports.recruitingStrategy?.length) {
          addSubsectionHeader('Athletic Recruiting Strategy', '#3b82f6')
          addBulletPoints(sports.recruitingStrategy)
        }

        if (sports.fitnessLeadership?.length) {
          addSubsectionHeader('Fitness Leadership', '#10b981')
          addBulletPoints(sports.fitnessLeadership)
        }
      }

      if (assessment.competitions_recommendations) {
        addSectionHeader('Competitions')

        const competitions = assessment.competitions_recommendations

        if (competitions.academicCompetitions?.length) {
          addSubsectionHeader('Academic Competitions', '#6366f1')
          addBulletPoints(competitions.academicCompetitions)
        }

        if (competitions.businessCompetitions?.length) {
          addSubsectionHeader('Business Competitions', '#10b981')
          addBulletPoints(competitions.businessCompetitions)
        }

        if (competitions.artsCompetitions?.length) {
          addSubsectionHeader('Arts Competitions', '#ec4899')
          addBulletPoints(competitions.artsCompetitions)
        }

        if (competitions.debateSpeech?.length) {
          addSubsectionHeader('Debate & Speech', '#f59e0b')
          addBulletPoints(competitions.debateSpeech)
        }
      }
    }

      if (assessment.passion_projects?.length) {
        addFooter()
        pdf.addPage()
        addPageHeader('Passion Projects')

        addParagraph('Passion projects demonstrate initiative, creativity, and genuine interest. These personalized project ideas align with your unique profile and can significantly strengthen your college applications.')

        assessment.passion_projects.forEach((project: { 
          title: string; 
          description: string; 
          timeCommitment: string; 
          skillsDeveloped: string[]; 
          applicationImpact: string; 
          resources: string;
          implementationSteps?: string[];
        }, index: number) => {
          addNewPageIfNeeded(100)

          pdf.setFillColor(250, 248, 243)
          pdf.roundedRect(margin, yPos, contentWidth, 80, 4, 4, 'F')
          pdf.setDrawColor(201, 162, 39)
          pdf.setLineWidth(0.8)
          pdf.roundedRect(margin, yPos, contentWidth, 80, 4, 4, 'S')

          pdf.setFillColor(201, 162, 39)
          pdf.circle(margin + 12, yPos + 12, 8, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(15)
          pdf.setFont('helvetica', 'bold')
          pdf.text(String(index + 1), margin + 12, yPos + 15, { align: 'center' })

          pdf.setTextColor(30, 58, 95)
          pdf.setFontSize(13)
          pdf.setFont('helvetica', 'bold')
          pdf.text(project.title, margin + 26, yPos + 14)

          pdf.setTextColor(201, 162, 39)
          pdf.setFontSize(9)
          pdf.text(project.timeCommitment || 'Varies', pageWidth - margin - 10, yPos + 14, { align: 'right' })

          yPos += 24
          pdf.setTextColor(90, 122, 154)
          pdf.setFontSize(9.5)
          pdf.setFont('helvetica', 'normal')
          const descLines = pdf.splitTextToSize(project.description, contentWidth - 28)
          pdf.text(descLines, margin + 10, yPos)
          yPos += descLines.length * 5 + 4

          pdf.setTextColor(30, 58, 95)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Impact:', margin + 10, yPos)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(90, 122, 154)
          const impactLines = pdf.splitTextToSize(project.applicationImpact, contentWidth - 30)
          pdf.text(impactLines.slice(0, 1), margin + 26, yPos)
          yPos += 8

          if (project.implementationSteps?.length) {
            pdf.setTextColor(30, 58, 95)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Steps:', margin + 10, yPos)
            pdf.setFont('helvetica', 'normal')
            pdf.setTextColor(90, 122, 154)
            const stepsText = project.implementationSteps.slice(0, 3).join(', ')
            const stepsLines = pdf.splitTextToSize(stepsText, contentWidth - 30)
            pdf.text(stepsLines.slice(0, 1), margin + 26, yPos)
            yPos += 8
          }

          pdf.setTextColor(30, 58, 95)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Resources:', margin + 10, yPos)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(90, 122, 154)
          const resourcesLines = pdf.splitTextToSize(project.resources, contentWidth - 32)
          pdf.text(resourcesLines.slice(0, 1), margin + 30, yPos)

          yPos += 15
        })
      }

      if (assessment.waste_of_time_activities) {
        addNewPageIfNeeded(60)
        addSectionHeader('What to Stop: Efficiency Optimization')
        addParagraph('To maximize your "spike" and competitive edge, we recommend phasing out activities that do not align with your core archetype.')

        ;(assessment.waste_of_time_activities?.activities || []).forEach((item: { activity: string, whyQuit: string }) => {
          addNewPageIfNeeded(30)
          pdf.setTextColor(239, 68, 68)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`Stop: ${item.activity}`, margin, yPos)
          yPos += 6
          pdf.setTextColor(90, 122, 154)
          pdf.setFont('helvetica', 'italic')
          const lines = pdf.splitTextToSize(`Why? ${item.whyQuit}`, contentWidth - 4)
          pdf.text(lines, margin, yPos)
          yPos += lines.length * 5 + 8
        })
      }

      if (assessment.internships_recommendations) {
      addFooter()
      pdf.addPage()
      addPageHeader('Internship Opportunities')

      const internships = assessment.internships_recommendations

      addParagraph('Professional experience through internships provides valuable skills, industry exposure, and impressive credentials for college applications.')

      if (internships.industryInternships?.length) {
        addSubsectionHeader('Industry Internships', '#3b82f6')
        addBulletPoints(internships.industryInternships)
      }

      if (internships.researchInternships?.length) {
        addSubsectionHeader('Research Internships', '#06b6d4')
        addBulletPoints(internships.researchInternships)
      }

      if (internships.nonprofitInternships?.length) {
        addSubsectionHeader('Nonprofit Internships', '#10b981')
        addBulletPoints(internships.nonprofitInternships)
      }

      if (internships.virtualOpportunities?.length) {
        addSubsectionHeader('Virtual Opportunities', '#8b5cf6')
        addBulletPoints(internships.virtualOpportunities)
      }
    }

    if (assessment.culture_arts_recommendations) {
      addNewPageIfNeeded(80)
      addSectionHeader('Culture & Arts')

      const arts = assessment.culture_arts_recommendations

      if (arts.performingArts?.length) {
        addSubsectionHeader('Performing Arts', '#ec4899')
        addBulletPoints(arts.performingArts)
      }

      if (arts.visualArts?.length) {
        addSubsectionHeader('Visual Arts', '#f59e0b')
        addBulletPoints(arts.visualArts)
      }

      if (arts.creativeWriting?.length) {
        addSubsectionHeader('Creative Writing', '#6366f1')
        addBulletPoints(arts.creativeWriting)
      }

      if (arts.culturalClubs?.length) {
        addSubsectionHeader('Cultural Clubs', '#10b981')
        addBulletPoints(arts.culturalClubs)
      }
    }

    addFooter()
    pdf.addPage()
    addPageHeader('Disclaimer & Next Steps')

      yPos = 60

      pdf.setFillColor(254, 249, 231)
      pdf.roundedRect(margin, yPos, contentWidth, 76, 4, 4, 'F')
      pdf.setDrawColor(201, 162, 39)
      pdf.setLineWidth(1)
      pdf.roundedRect(margin, yPos, contentWidth, 76, 4, 4, 'S')

      pdf.setTextColor(30, 58, 95)
      pdf.setFontSize(13)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Important Disclaimer', margin + 12, yPos + 14)

      pdf.setTextColor(90, 122, 154)
      pdf.setFontSize(9.5)
      pdf.setFont('helvetica', 'normal')

      const disclaimer = `Student Blueprint has been designed to help US high school students, parents and teachers. We use a proprietary mix of behavioral, aspirational and education insights to give the student some broad, directional guidance that could lead to clarity and confidence about career development.

The content of this success plan is based on the survey answers provided by individual students. This report should not be used to identify, diagnose, or treat psychological, mental health, and/or medical problems. Additionally, this report is not to be used to evaluate any individual for any form of employment.

The user assumes sole responsibility for any actions or decisions that are made as a result of using this aid for self-discovery.`

      const disclaimerLines = pdf.splitTextToSize(disclaimer, contentWidth - 24)
      pdf.text(disclaimerLines, margin + 12, yPos + 25)

      yPos += 90

      addSectionHeader('Recommended Next Steps')

      const nextSteps = [
        'Review this report thoroughly with your parents or guardians',
        'Prioritize 2-3 immediate action items from your roadmap',
        'Schedule a consultation with a Student Blueprint counselor for personalized guidance',
        'Begin researching specific programs and opportunities mentioned in this report',
        'Create a calendar with deadlines for applications and activities',
        'Start building relationships with potential mentors in your areas of interest'
      ]
      addBulletPoints(nextSteps)

      yPos += 8

      pdf.setFillColor(30, 58, 95)
      pdf.roundedRect(margin, yPos, contentWidth, 40, 4, 4, 'F')
      pdf.setTextColor(201, 162, 39)
      pdf.setFontSize(15)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Ready to Take Action?', pageWidth / 2, yPos + 14, { align: 'center' })
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10.5)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Schedule a one-on-one consultation with our expert counselors', pageWidth / 2, yPos + 25, { align: 'center' })
      pdf.text('to put your personalized roadmap into action.', pageWidth / 2, yPos + 33, { align: 'center' })

    addFooter()

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${studentName.replace(/[^a-zA-Z0-9]/g, '-')}-StudentBlueprint-Report.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
