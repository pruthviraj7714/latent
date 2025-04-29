"use client"
import { useSearchParams } from "next/navigation"

export default function EventsPage() {
    const searchParams = useSearchParams();
    const category = searchParams.get('category');
    return (
        <div>
            {JSON.stringify(category)}
        </div>
    )
}