import React from 'react'

interface RefreshingOverlayProps {
  id?: string
}

export const CANCEL_REFRESH_BUTTON_ID = 'yontil-cancel-refresh-button'

export default function RefreshingOverlay({ id }: RefreshingOverlayProps) {
  return (
    <div
      id={id}
      className="yt-fixed yt-inset-0 yt-z-[9999] yt-flex yt-flex-col yt-items-center yt-justify-center yt-gap-2 yt-bg-black/50"
    >
      <div className="yt-text-xl yt-font-bold yt-text-white">
        로그인하는 중입니다. 잠시만 기다려주세요.
      </div>
      <button
        id={CANCEL_REFRESH_BUTTON_ID}
        className="yt-cursor-pointer yt-border-none yt-bg-transparent yt-p-1 yt-text-white hover:yt-underline focus:yt-outline-none"
      >
        취소
      </button>
    </div>
  )
}
