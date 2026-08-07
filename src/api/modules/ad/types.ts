/**
 * 用户广告接口类型
 */

export interface AdItem {
  created_at: string
  id: number | string
  image_url: string
  link_url: string
  sort: number | string
  status: number | string | boolean
  title: string
  updated_at: string
}

export type AdList = AdItem[]
