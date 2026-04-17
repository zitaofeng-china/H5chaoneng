/**
 * 地址模块 API
 */
import { get, post, deleteRequest } from '@/api/request'
import type { ApiResponse } from '@/api/types'
import type { 
  GetAddressParams, 
  AddressData, 
  GetHostingListParams, 
  HostingListData,
  AddHostingAddressParams,
  DeleteHostingAddressParams
} from './types'

/**
 * 获取付款地址
 * @param params - 请求参数
 * @returns 付款地址数据
 */
export function getAddress(params: GetAddressParams): Promise<ApiResponse<AddressData>> {
  return get<AddressData>('/v3/address', params)
}

/**
 * 获取托管列表
 * @param params - 请求参数
 * @returns 托管列表数据
 */
export function getHostingList(params: GetHostingListParams): Promise<ApiResponse<HostingListData>> {
  return get<HostingListData>('/v3/hosting/list', params)
}

/**
 * 添加托管地址
 * @param params - 请求参数（地址数组）
 * @returns 添加结果
 */
export function addHostingAddress(params: AddHostingAddressParams): Promise<ApiResponse<string>> {
  // 将地址数组拼接成逗号分隔的字符串作为路径参数
  const addressPath = params.address.join(',')
  return post<string>(`/v3/hosting/${addressPath}`)
}

/**
 * 删除托管地址
 * @param params - 请求参数（地址）
 * @returns 删除结果
 */
export function deleteHostingAddress(params: DeleteHostingAddressParams): Promise<ApiResponse<string>> {
  return deleteRequest<string>(`/v3/hosting/${params.address}`)
}
