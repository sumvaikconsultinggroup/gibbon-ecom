import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Allowed file types
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif']
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadType = formData.get('type') as string // 'image' or 'video'
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Determine allowed types and max size based on upload type
    let allowedTypes: string[]
    let maxSize: number
    let subDir: string

    if (uploadType === 'video') {
      allowedTypes = allowedVideoTypes
      maxSize = 100 * 1024 * 1024 // 100MB for videos
      subDir = 'videos'
    } else {
      allowedTypes = allowedImageTypes
      maxSize = 5 * 1024 * 1024 // 5MB for images
      subDir = 'images'
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` 
      }, { status: 400 })
    }

    // Create unique filename
    const ext = file.name.split('.').pop() || (uploadType === 'video' ? 'mp4' : 'jpg')
    const filename = `${uuidv4()}.${ext}`
    
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir)
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (e) {
      // Directory might already exist
    }

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return public URL
    const url = `/uploads/${subDir}/${filename}`

    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Note: In Next.js App Router, body parsing config is not needed
// The route handler automatically handles FormData
