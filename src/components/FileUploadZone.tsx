// src/components/FileUploadZone.tsx
'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Upload, X, FileImage, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadFile {
  id: string
  file: File
  name: string
  size: number
  preview?: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  url?: string
}

interface FileUploadZoneProps {
  projectId?: string
  accept?: string
  maxSize?: number // MB
  maxFiles?: number
  isPublic?: boolean
  onUploadComplete?: (files: { url: string; key: string; name: string }[]) => void
  onUploadError?: (error: string) => void
}

export function FileUploadZone({
  projectId,
  accept = 'image/png,image/jpeg,image/webp',
  maxSize = 10,
  maxFiles = 5,
  isPublic = false,
  onUploadComplete,
  onUploadError,
}: FileUploadZoneProps) {
  const t = useTranslations('upload')
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const generateId = () => Math.random().toString(36).substring(2, 9)

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve('')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return t('errorTooLarge', { maxSize: String(maxSize) })
    }
    const acceptedTypes = accept.split(',')
    if (!acceptedTypes.includes(file.type)) {
      return t('errorType', { types: accept })
    }
    return null
  }

  const uploadFile = async (uploadFile: UploadFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading' } : f))
    )

    try {
      // 使用 FormData 直接上传到 Worker API
      const formData = new FormData()
      formData.append('file', uploadFile.file)
      formData.append('public', isPublic ? 'true' : 'false')
      if (projectId) {
        formData.append('projectId', projectId)
      }

      // XHR for upload progress tracking
      const result = await new Promise<{ url: string; key: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setFiles((prev) =>
              prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
            )
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText))
            } catch {
              resolve(JSON.parse(xhr.responseText))
            }
          } else {
            let errMsg = `Upload failed: ${xhr.status}`
            try {
              const err = JSON.parse(xhr.responseText)
              errMsg = err.error || errMsg
            } catch { /* use default */ }
            reject(new Error(errMsg))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error')))
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

        xhr.open('POST', '/api/files/upload', true)
        xhr.send(formData)
      })

      // 标记成功
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: 'success', progress: 100, url: result.url }
            : f
        )
      )

      // 触发完成回调
      const completedFiles = files
        .filter((f) => f.status === 'success' || f.id === uploadFile.id)
        .map((f) => ({
          url: f.url || result.url,
          key: result.key,
          name: f.name,
        }))
      onUploadComplete?.(completedFiles)

    } catch (err) {
      const message = err instanceof Error ? err.message : t('errorUpload')
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'error', error: message } : f
        )
      )
      onUploadError?.(message)
    }
  }

  const addFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return

    const filesArray = Array.from(newFiles)
    if (files.length + filesArray.length > maxFiles) {
      onUploadError?.(t('errorMaxFiles', { max: String(maxFiles) }))
      return
    }

    const uploadFiles: UploadFile[] = await Promise.all(
      filesArray.map(async (file) => {
        const error = validateFile(file)
        const preview = error ? undefined : await createPreview(file)
        return {
          id: generateId(),
          file,
          name: file.name,
          size: file.size,
          preview,
          progress: 0,
          status: error ? 'error' : 'pending',
          error: error || undefined,
        }
      })
    )

    setFiles((prev) => [...prev, ...uploadFiles])

    // 自动开始上传合法文件
    uploadFiles.forEach((uf) => {
      if (!uf.error) {
        uploadFile(uf)
      }
    })
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <div className="w-full space-y-4">
      {/* 拖放区域 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
          'hover:bg-muted/50',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        <Upload className={cn('h-10 w-10 mb-3', isDragOver ? 'text-primary' : 'text-muted-foreground')} />
        <p className="text-sm font-medium text-center">
          {isDragOver ? t('dropHere') : t('dragOrClick')}
        </p>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          {t('constraints', { maxSize: String(maxSize), maxFiles: String(maxFiles) })}
        </p>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                file.status === 'error' && 'border-destructive/50 bg-destructive/5',
                file.status === 'success' && 'border-green-500/50 bg-green-500/5',
                file.status === 'uploading' && 'border-primary/50 bg-primary/5'
              )}
            >
              {/* 预览图 */}
              {file.preview ? (
                <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-muted flex-shrink-0">
                  <FileImage className="h-5 w-5 text-muted-foreground" />
                </div>
              )}

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>

                {/* 进度条 */}
                {file.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{file.progress}%</p>
                  </div>
                )}

                {/* 状态标签 */}
                {file.status === 'success' && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('statusSuccess')}
                  </div>
                )}
                {file.status === 'error' && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {file.error}
                  </div>
                )}
              </div>

              {/* 删除按钮 */}
              <button
                onClick={() => removeFile(file.id)}
                className="flex-shrink-0 rounded p-1 hover:bg-muted transition-colors"
                title={t('remove')}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}