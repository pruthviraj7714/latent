"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface TicketCardProps {
  name: string
  price: number
  available: number
  selected: number
  onSelect: (count: number) => void
  showQuantityControls?: boolean
}

export function TicketCard({
  name,
  price,
  available,
  selected,
  onSelect,
  showQuantityControls = false,
}: TicketCardProps) {
  const handleIncrement = () => {
    if (selected < available) {
      onSelect(selected + 1)
    }
  }

  const handleDecrement = () => {
    if (selected > 0) {
      onSelect(selected - 1)
    }
  }

  return (
    <div
      className={`bg-white rounded-xl border ${selected > 0 ? "border-red-500 border-2" : "border-neutral-800"} p-4 flex flex-col md:flex-row justify-between`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{name}</h4>
          <span className="text-xs text-neutral-500">{available} available</span>
        </div>
        <p className="text-lg font-semibold">₹{price.toLocaleString()}</p>
      </div>

      {showQuantityControls ? (
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleDecrement}
            disabled={selected === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{selected}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleIncrement}
            disabled={selected >= available}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant={selected > 0 ? "default" : "outline"}
          className="mt-4 md:mt-0"
          onClick={() => onSelect(selected > 0 ? 0 : 1)}
        >
          {selected > 0 ? "Selected" : "Select"}
        </Button>
      )}
    </div>
  )
}
