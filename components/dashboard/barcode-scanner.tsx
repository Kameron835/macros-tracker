'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

type BarcodeScannerProps = {
  onDetected: (barcode: string) => void
}

const scannerRegionId = 'barcode-scanner-region'

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')

  async function startScanner() {
    setError('')

    try {
      const scanner = new Html5Qrcode(scannerRegionId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: {
            width: 280,
            height: 160,
          },
        },
        async (decodedText) => {
          onDetected(decodedText)

          if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop()
            await scannerRef.current.clear()
          }

          scannerRef.current = null
          setIsScanning(false)
        },
        () => {}
      )

      setIsScanning(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not start camera scanner.'
      )
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
      }

      scannerRef.current = null
      setIsScanning(false)
    } catch {
      setIsScanning(false)
    }
  }

 useEffect(() => {
  return () => {
    const scanner = scannerRef.current

    if (scanner?.isScanning) {
      scanner.stop().catch(() => {
        // Ignore cleanup errors.
      })
    }

    scanner?.clear()
    scannerRef.current = null
  }
}, [])

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Camera scanner</h3>
          <p className="mt-1 text-sm text-neutral-400">
            Use your phone or webcam to scan a UPC/EAN barcode.
          </p>
        </div>

        <div className="flex gap-2">
          {!isScanning ? (
            <button
              type="button"
              onClick={startScanner}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
            >
              Start scan
            </button>
          ) : (
            <button
              type="button"
              onClick={stopScanner}
              className="rounded-xl border border-red-500/50 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500 hover:text-white"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      <div
        id={scannerRegionId}
        className={`mt-4 overflow-hidden rounded-xl border border-neutral-800 ${
          isScanning ? 'block' : 'hidden'
        }`}
      />

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
    </div>
  )
}