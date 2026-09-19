export interface PopupControl {
  open: () => void | Promise<void>
  close: () => void
}

export type PopupName =
  | 'loginPopup'
  | 'registerPopup'
  | 'resetPopup'
  | 'revisePasswordPopup'
  | 'rechargePopup'
  | 'userInfoPopup'

const popupRegistry = new Map<PopupName, PopupControl>()

export function registerPopup(name: PopupName, popup: PopupControl): void {
  popupRegistry.set(name, popup)
}

export function getPopup(name: PopupName): PopupControl | undefined {
  return popupRegistry.get(name)
}
