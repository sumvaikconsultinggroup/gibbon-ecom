'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, Link2, X, Image as ImageIcon, Loader2, 
  Check, AlertCircle, Camera, Trash2
} from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  placeholder?: string
  aspectRatio?: 'square' | 'video' | 'banner' | 'portrait' | 'auto'
  maxSizeMB?: number
  className?: string
  showPreview?: boolean
  label?: string
  hint?: string
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  placeholder = 'Upload image or paste URL',
  aspectRatio = 'auto',
  maxSizeMB = 5,
  className = '',
  showPreview = true,
  label,
  hint
}: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
    portrait: 'aspect-[3/4]',
    auto: 'min-h-[200px]'
  }

  const validateImageUrl = (url: string): boolean => {
    try {
      new URL(url)
      return /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(url) || 
             url.includes('unsplash.com') || 
             url.includes('cloudinary.com') ||
             url.includes('cdn.shopify.com') ||
             url.includes('images.') ||
             url.includes('/image')
    } catch {
      return false
    }
  }

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be less than ${maxSizeMB}MB`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress (since fetch doesn't support progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // Upload to API
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      
      if (data.success && data.url) {
        setUploadProgress(100)
        onChange(data.url)
      } else {
        // Fallback: Convert to base64 data URL for demo
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          onChange(base64)
          setUploadProgress(100)
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      // Fallback: Convert to base64 data URL
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        onChange(base64)
        setUploadProgress(100)
      }
      reader.readAsDataURL(file)
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }, [maxSizeMB, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleUrlSubmit = () => {
    setError(null)
    
    if (!urlInput.trim()) {
      setError('Please enter an image URL')
      return
    }

    if (!validateImageUrl(urlInput)) {
      setError('Please enter a valid image URL')
      return
    }

    onChange(urlInput.trim())
    setUrlInput('')
  }

  const handleRemove = () => {
    onChange('')
    setUrlInput('')
    setError(null)
    onRemove?.()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}

      {/* Preview or Upload Area */}
      {value && showPreview ? (
        <div className={`relative overflow-hidden rounded-xl border-2 border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 ${aspectRatioClasses[aspectRatio]}`}>
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            onError={() => setError('Failed to load image')}
          />
          <div className="absolute inset-0 bg-black/0 transition-all hover:bg-black/40 group">
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-white p-2 shadow-lg transition-transform hover:scale-110"
                title="Replace image"
              >
                <Camera className="h-5 w-5 text-neutral-700" />
              </button>
              <button
                onClick={handleRemove}
                className="rounded-lg bg-red-500 p-2 shadow-lg transition-transform hover:scale-110"
                title="Remove image"
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mode Tabs */}
          <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
            <button
              onClick={() => setMode('upload')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                mode === 'upload'
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
            <button
              onClick={() => setMode('url')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                mode === 'url'
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Link2 className="h-4 w-4" />
              URL
            </button>
          </div>

          {/* Upload Mode */}
          <AnimatePresence mode="wait">
            {mode === 'upload' ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${aspectRatioClasses[aspectRatio]} flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-600'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                {isUploading ? (
                  <div className="space-y-3">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
                    <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                      <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-neutral-500">Uploading... {uploadProgress}%</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                      <ImageIcon className="h-8 w-8 text-neutral-400" />
                    </div>
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">
                      {isDragging ? 'Drop image here' : 'Click to upload or drag & drop'}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      PNG, JPG, GIF, WebP up to {maxSizeMB}MB
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="url"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      placeholder="https://example.com/image.jpg"
                      className="w-full rounded-lg border border-neutral-300 py-3 pl-10 pr-4 outline-none transition-colors focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                  </div>
                  <button
                    onClick={handleUrlSubmit}
                    className="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-xs text-neutral-500">
                  Enter a direct link to an image (JPG, PNG, GIF, WebP)
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-red-600"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </motion.div>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="text-xs text-neutral-500">{hint}</p>
      )}
    </div>
  )
}
