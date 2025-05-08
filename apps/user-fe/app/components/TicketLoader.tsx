"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TicketLoaderProps {
  text?: string
  size?: "small" | "medium" | "large"
  duration?: number
}

export default function TicketLoader({
  text = "Loading...",
  size = "medium",
  duration = 2000,
}: TicketLoaderProps) {
  const [dots, setDots] = useState("")
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 400)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const sizeConfig = {
    small: {
      container: "w-48 h-48",
      ticket: "w-16 h-8",
      text: "text-sm",
    },
    medium: {
      container: "w-64 h-64",
      ticket: "w-20 h-10",
      text: "text-base",
    },
    large: {
      container: "w-80 h-80",
      ticket: "w-24 h-12",
      text: "text-lg",
    },
  }

  const config = sizeConfig[size]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
        >
          <div className={`flex flex-col items-center justify-center ${config.container}`}>
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300/30"></div>

              <motion.div
                className={`absolute ${config.ticket} bg-red-600 rounded-md flex items-center justify-center text-white font-bold`}
                animate={{
                  rotate: [0, 360],
                  x: [0, 20, 0, -20, 0],
                  y: [-50, -30, 0, 30, 50, 30, 0, -30, -50],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{ top: "calc(50% - 20px)", left: "calc(50% - 40px)" }}
              >
                <span className="text-xs">TICKET</span>
              </motion.div>

              <motion.div
                className={`absolute ${config.ticket} bg-purple-600 rounded-md flex items-center justify-center text-white font-bold`}
                animate={{
                  rotate: [180, 540],
                  x: [0, -20, 0, 20, 0],
                  y: [50, 30, 0, -30, -50, -30, 0, 30, 50],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                  delay: 0.5,
                }}
                style={{ top: "calc(50% - 20px)", left: "calc(50% - 40px)" }}
              >
                <span className="text-xs">TICKET</span>
              </motion.div>

              <motion.div
                className={`absolute ${config.ticket} bg-yellow-500 rounded-md flex items-center justify-center text-white font-bold`}
                animate={{
                  rotate: [90, 450],
                  x: [50, 30, 0, -30, -50, -30, 0, 30, 50],
                  y: [0, 20, 0, -20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                  delay: 1,
                }}
                style={{ top: "calc(50% - 20px)", left: "calc(50% - 40px)" }}
              >
                <span className="text-xs">TICKET</span>
              </motion.div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                <span className="text-red-600 font-bold text-lg">Latent</span>
              </div>
            </div>

            <motion.p
              className={`text-white font-medium ${config.text}`}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              {text}
              <span className="inline-block w-8">{dots}</span>
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
