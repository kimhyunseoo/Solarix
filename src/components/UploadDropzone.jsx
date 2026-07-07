import { useRef, useState } from 'react'
import { UploadCloud, Camera } from 'lucide-react'

export default function UploadDropzone({ onFileSelected }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (files) => {
    const file = files?.[0]
    if (file && file.type.startsWith('image/')) {
      onFileSelected(file)
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'
      }`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
        <UploadCloud size={28} />
      </span>
      <p className="mt-4 text-lg font-semibold text-slate-800">Upload a road photo</p>
      <p className="mt-1 text-sm text-slate-500">
        Click or drag and drop a file here (JPG, PNG)
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
        >
          <Camera size={16} />
          Upload Photo
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
