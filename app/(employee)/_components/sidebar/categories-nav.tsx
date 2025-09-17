"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type CategoryWithSubCategories = {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date | null
  subCategories: Array<{
    id: number
    name: string
    categoryId: number
    categoryName: string
  }>
}

export function CategoriesNav() {
  const [categories, setCategories] = useState<CategoryWithSubCategories[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Categories</SidebarGroupLabel>
        <SidebarMenu>
          <div className="px-2 py-2 text-sm text-muted-foreground">
            Loading categories...
          </div>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  if (categories.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Categories</SidebarGroupLabel>
        <SidebarMenu>
          <div className="px-2 py-2 text-sm text-muted-foreground">
            No categories found.
          </div>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Buckets</SidebarGroupLabel>
      <SidebarMenu>
        {categories.map((category) => (
          <SidebarMenuItem key={category.id}>
            <SidebarMenuButton asChild tooltip={category.name}>
              <Link href="#">
                <span>{category.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
} 