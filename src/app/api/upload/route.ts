import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: 'File too large' }, { status: 400 })
    }

    // Create unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${uuidv4()}.${ext}`
    
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
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
    const url = `/uploads/${filename}`

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

export const config = {
  api: {
    bodyParser: false,
  },
}
