import React from 'react'

interface RefreshingOverlayProps {
  id?: string
}

export default function RefreshingOverlay({ id }: RefreshingOverlayProps) {
  return (
    <div
      id={id}
      className="yt-fixed yt-inset-0 yt-z-[9999] yt-flex yt-items-center yt-justify-center yt-bg-black/50"
    >
      <div className="yt-text-xl yt-font-bold yt-text-white">
        로그인하는 중입니다. 잠시만 기다려주세요.
      </div>
    </div>
  )
}
