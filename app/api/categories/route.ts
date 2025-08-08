import { NextResponse } from "next/server"
import { getCategoriesWithSubCategories } from "@/lib/db/queries"

export async function GET() {
  try {
    const categories = await getCategoriesWithSubCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
} 