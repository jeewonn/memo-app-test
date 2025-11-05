'use server'

import { createServerClient } from '@/lib/supabase'
import { Memo, MemoFormData } from '@/types/memo'

export async function getMemos(): Promise<Memo[]> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching memos:', error)
    throw error
  }

  // 데이터베이스 스키마를 Memo 타입으로 변환
  return (data || []).map(memo => ({
    id: memo.id,
    title: memo.title,
    content: memo.content,
    category: memo.category,
    tags: memo.tags || [],
    createdAt: memo.created_at,
    updatedAt: memo.updated_at,
  }))
}

export async function createMemo(formData: MemoFormData): Promise<Memo> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('memos')
    .insert({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags || [],
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating memo:', error)
    throw error
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updateMemo(id: string, formData: MemoFormData): Promise<Memo> {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('memos')
    .update({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags || [],
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating memo:', error)
    throw error
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function deleteMemo(id: string): Promise<void> {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting memo:', error)
    throw error
  }
}


