import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import NavigationItem from '@/models/NavigationItem'

// GET - Public endpoint to fetch active navigation for frontend
export async function GET() {
  try {
    await connectDb()
    
    // Fetch only active items that should show in header
    const rootItems = await NavigationItem.find({ 
      parent: null, 
      isActive: true,
      showInHeader: true
    })
      .sort({ order: 1 })
      .populate('featuredProducts', 'title handle images variants')
      .lean()
    
    // Build hierarchy
    const buildHierarchy = async (parentId: any): Promise<any[]> => {
      const children = await NavigationItem.find({ 
        parent: parentId,
        isActive: true
      })
        .sort({ order: 1 })
        .populate('featuredProducts', 'title handle images variants')
        .lean()
      
      return Promise.all(children.map(async (child: any) => {
        const grandChildren = await buildHierarchy(child._id)
        return {
          id: child._id.toString(),
          name: child.name,
          href: child.href,
          type: child.type,
          icon: child.icon,
          badge: child.badge,
          badgeColor: child.badgeColor,
          description: child.description,
          image: child.image,
          showInMobile: child.showInMobile,
          openInNewTab: child.openInNewTab,
          cssClass: child.cssClass,
          children: grandChildren,
          featuredProducts: child.featuredProducts?.map((p: any) => ({
            id: p._id.toString(),
            title: p.title,
            handle: p.handle,
            image: p.images?.[0]?.src,
            price: p.variants?.[0]?.price
          }))
        }
      }))
    }
    
    const hierarchicalData = await Promise.all(rootItems.map(async (item: any) => {
      const children = await buildHierarchy(item._id)
      return {
        id: item._id.toString(),
        name: item.name,
        href: item.href,
        type: item.type,
        icon: item.icon,
        badge: item.badge,
        badgeColor: item.badgeColor,
        description: item.description,
        image: item.image,
        showInMobile: item.showInMobile,
        openInNewTab: item.openInNewTab,
        cssClass: item.cssClass,
        children,
        featuredProducts: item.featuredProducts?.map((p: any) => ({
          id: p._id.toString(),
          title: p.title,
          handle: p.handle,
          image: p.images?.[0]?.src,
          price: p.variants?.[0]?.price
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
