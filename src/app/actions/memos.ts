'use server'

import { createServerClient } from '@/lib/supabase'
import { Memo, MemoFormData } from '@/types/memo'
import type { Database } from '@/lib/supabase'

type MemoRow = Database['public']['Tables']['memos']['Row']
type MemoInsert = Database['public']['Tables']['memos']['Insert']
type MemoUpdate = Database['public']['Tables']['memos']['Update']

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
  return (data || []).map((memo: MemoRow) => ({
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
  
  const insertData: MemoInsert = {
    title: formData.title,
    content: formData.content,
    category: formData.category,
    tags: formData.tags || [],
  }
  
  const { data, error } = await supabase
    .from('memos')
    // @ts-expect-error - Supabase 타입 추론 문제로 인한 임시 해결책
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating memo:', error)
    throw error
  }

  const memo = data as MemoRow

  return {
    id: memo.id,
    title: memo.title,
    content: memo.content,
    category: memo.category,
    tags: memo.tags || [],
    createdAt: memo.created_at,
    updatedAt: memo.updated_at,
  }
}

export async function updateMemo(id: string, formData: MemoFormData): Promise<Memo> {
  const supabase = createServerClient()
  
  const updateData: MemoUpdate = {
    title: formData.title,
    content: formData.content,
    category: formData.category,
    tags: formData.tags || [],
  }
  
  const { data, error } = await supabase
    .from('memos')
    // @ts-expect-error - Supabase 타입 추론 문제로 인한 임시 해결책
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating memo:', error)
    throw error
  }

  const memo = data as MemoRow

  return {
    id: memo.id,
    title: memo.title,
    content: memo.content,
    category: memo.category,
    tags: memo.tags || [],
    createdAt: memo.created_at,
    updatedAt: memo.updated_at,
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


