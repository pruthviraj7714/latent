"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const seatTypes = [
  { value: "REGULAR", label: "Regular" },
  { value: "PREMIUM", label: "Premium" },
  { value: "RECLINER", label: "Recliner" },
  { value: "VIP", label: "VIP" },
  { value: "COUPLE", label: "Couple" },
  { value: "BALCONY", label: "Balcony" },
  { value: "SOFA", label: "Sofa" },
  { value: "LUXURY", label: "Luxury" },
]

export default function SeatTypeFilter({ onChange }: { onChange?: (selectedTypes: string[]) => void }) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const handleSelect = (value: string) => {
    const newSelection = selectedTypes.includes(value)
      ? selectedTypes.filter((type) => type !== value)
      : [...selectedTypes, value]

    setSelectedTypes(newSelection)
    if (onChange) {
      onChange(newSelection)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-dashed">
          Seat Type {selectedTypes.length > 0 && `(${selectedTypes.length})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Seat Types</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {seatTypes.map((type) => (
          <DropdownMenuCheckboxItem
            key={type.value}
            checked={selectedTypes.includes(type.value)}
            onCheckedChange={() => handleSelect(type.value)}
          >
            {type.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
