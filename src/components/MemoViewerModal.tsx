'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Memo, MemoFormData, MEMO_CATEGORIES, DEFAULT_CATEGORIES } from '@/types/memo'

// SSR 방지를 위한 동적 import
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
})
const Markdown = dynamic(
  () => import('@uiw/react-md-editor').then(mod => mod.default.Markdown),
  { ssr: false }
)

interface MemoViewerModalProps {
  isOpen: boolean
  memo: Memo | null
  onClose: () => void
  onUpdate: (id: string, data: MemoFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function MemoViewerModal({
  isOpen,
  memo,
  onClose,
  onUpdate,
  onDelete,
}: MemoViewerModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<MemoFormData>({
    title: '',
    content: '',
    category: 'personal',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (memo) {
      setFormData({
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags,
      })
      setIsEditing(false)
    }
  }, [memo])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSave = async () => {
    if (!memo || !formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }
    try {
      await onUpdate(memo.id, formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update memo:', error)
      // 에러는 부모 컴포넌트에서 처리됨
    }
  }

  const handleDelete = async () => {
    if (!memo) return
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      try {
        await onDelete(memo.id)
        onClose()
      } catch (error) {
        console.error('Failed to delete memo:', error)
        // 에러는 부모 컴포넌트에서 처리되므로 여기서는 모달만 닫지 않음
      }
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  if (!isOpen || !memo) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackgroundClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="text-2xl font-bold text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="메모 제목"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {memo.title}
                </h2>
              )}
              <div className="flex items-center gap-3 mt-2">
                {isEditing ? (
                  <select
                    value={formData.category}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {DEFAULT_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {MEMO_CATEGORIES[category]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(memo.category)}`}
                  >
                    {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                      memo.category}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {formatDate(memo.updatedAt)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-4"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 내용 */}
          <div className="mb-6">
            {isEditing ? (
              <div data-color-mode="light" className="markdown-editor-wrapper">
                <MDEditor
                  value={formData.content}
                  onChange={(value) =>
                    setFormData(prev => ({
                      ...prev,
                      content: value || '',
                    }))
                  }
                  preview="live"
                  hideToolbar={false}
                  visibleDragbar={true}
                  height={400}
                  textareaProps={{
                    placeholder: '마크다운 형식으로 메모를 작성하세요',
                  }}
                />
              </div>
            ) : (
              <div data-color-mode="light" className="text-gray-700 leading-relaxed markdown-preview-wrapper">
                <Markdown source={memo.content} />
              </div>
            )}
          </div>

          {/* 태그 */}
          <div className="mb-6">
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="태그를 입력하고 Enter를 누르세요"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    추가
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              memo.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {memo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    if (memo) {
                      setFormData({
                        title: memo.title,
                        content: memo.content,
                        category: memo.category,
                        tags: memo.tags,
                      })
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  저장하기
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  편집
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

