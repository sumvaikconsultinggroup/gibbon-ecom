import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import NavigationItem from '@/models/NavigationItem'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'gibbon-admin-secret-ad5f7eaf7fc29d4d02762686eecdabc3'

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// GET - Fetch all navigation items with hierarchy
export async function GET(request: Request) {
  try {
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const flat = searchParams.get('flat') === 'true'
    const activeOnly = searchParams.get('activeOnly') === 'true'
    
    let query: any = {}
    if (activeOnly) {
      query.isActive = true
    }
    
    if (flat) {
      // Return flat list with all items
      const items = await NavigationItem.find(query)
        .sort({ order: 1 })
        .populate('featuredProducts', 'title handle images variants')
        .lean()
      
      return NextResponse.json({
        success: true,
        data: items.map((item: any) => ({
          ...item,
          _id: item._id.toString(),
          parent: item.parent?.toString() || null,
          featuredProducts: item.featuredProducts?.map((p: any) => ({
            ...p,
            _id: p._id.toString()
          }))
        }))
      })
    }
    
    // Return hierarchical structure
    const rootItems = await NavigationItem.find({ ...query, parent: null })
      .sort({ order: 1 })
      .populate({
        path: 'featuredProducts',
        select: 'title handle images variants'
      })
      .lean()
    
    // Build hierarchy
    const buildHierarchy = async (parentId: any): Promise<any[]> => {
      const children = await NavigationItem.find({ ...query, parent: parentId })
        .sort({ order: 1 })
        .populate('featuredProducts', 'title handle images variants')
        .lean()
      
      return Promise.all(children.map(async (child: any) => {
        const grandChildren = await buildHierarchy(child._id)
        return {
          ...child,
          _id: child._id.toString(),
          parent: child.parent?.toString() || null,
          children: grandChildren,
          featuredProducts: child.featuredProducts?.map((p: any) => ({
            ...p,
            _id: p._id.toString()
          }))
        }
      }))
    }
    
    const hierarchicalData = await Promise.all(rootItems.map(async (item: any) => {
      const children = await buildHierarchy(item._id)
      return {
        ...item,
        _id: item._id.toString(),
        parent: null,
        children,
        featuredProducts: item.featuredProducts?.map((p: any) => ({
          ...p,
          _id: p._id.toString()
        }))
      }
    }))
    
    return NextResponse.json({
      success: true,
      data: hierarchicalData
    })
  } catch (error: any) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch navigation' },
      { status: 500 }
    )
  }
}

// POST - Create new navigation item
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDb()
    const body = await request.json()
    
    const { name, href, type, parent, icon, badge, badgeColor, description, image, 
            showInHeader, showInFooter, showInMobile, openInNewTab, cssClass, featuredProducts } = body
    
    if (!name || !href) {
      return NextResponse.json(
        { success: false, error: 'Name and href are required' },
        { status: 400 }
      )
    }
    
    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Check for duplicate slug
    const existingSlug = await NavigationItem.findOne({ slug })
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug
    
    // Get max order for parent
    const maxOrder = await NavigationItem.findOne({ parent: parent || null })
      .sort({ order: -1 })
      .select('order')
    const order = (maxOrder?.order || 0) + 1
    
    const navigationItem = await NavigationItem.create({
      name,
      href,
      slug: finalSlug,
      order,
      type: type || 'link',
      parent: parent || null,
      icon,
      badge,
      badgeColor,
      description,
      image,
      showInHeader: showInHeader !== false,
      showInFooter: showInFooter === true,
      showInMobile: showInMobile !== false,
      openInNewTab: openInNewTab === true,
      cssClass,
      featuredProducts: featuredProducts || [],
      isActive: true
    })
    
    return NextResponse.json({
      success: true,
      data: {
        ...navigationItem.toObject(),
        _id: navigationItem._id.toString(),
        parent: navigationItem.parent?.toString() || null
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating navigation item:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create navigation item' },
      { status: 500 }
    )
  }
}
