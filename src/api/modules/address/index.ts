/**
 * 地址模块 API
 */
import { get } from '@/api/request'
import type { ApiResponse } from '@/api/types'
import type { GetAddressParams, AddressData } from './types'

/**
 * 获取付款地址
 * @param params - 请求参数
 * @returns 付款地址数据
 */
export function getAddress(params: GetAddressParams): Promise<ApiResponse<AddressData>> {
  return get<AddressData>('/v3/address', params)
}
