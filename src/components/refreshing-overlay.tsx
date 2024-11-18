import React from 'react'

interface RefreshingOverlayProps {
  id?: string
}

export default function RefreshingOverlay({ id }: RefreshingOverlayProps) {
  return (
    <div
      id={id}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
    >
      <div className="text-xl font-bold text-white">
        로그인하는 중입니다. 잠시만 기다려주세요.
      </div>
    </div>
  )
}
