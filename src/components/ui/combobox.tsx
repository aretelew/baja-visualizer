"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Combobox({
  options,
  value,
  onChange,
  className,
  placeholder = "Select option...",
  searchPlaceholder = "Search option...",
  noResultsText = "No option found.",
  // Performance-related options
  maxItemsToRender = 150,
  largeListThreshold = 500,
  minSearchChars = 2,
  truncateLabel = true,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  searchPlaceholder?: string
  noResultsText?: string
  /** Maximum number of items to mount in the list to avoid large DOM trees */
  maxItemsToRender?: number
  /** If options length exceeds this, require at least minSearchChars before listing */
  largeListThreshold?: number
  /** For very large lists, require this many characters before showing results */
  minSearchChars?: number
  /** Control whether the selected label is truncated with ellipsis */
  truncateLabel?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const listRef = React.useRef<HTMLDivElement>(null)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [search])

  // Pre-filter on the client to both speed up rendering and reduce DOM size.
  const needsSearchGate = options.length >= largeListThreshold && search.length < minSearchChars
  const filtered = React.useMemo(() => {
    if (needsSearchGate) return [] as { value: string; label: string }[]
    if (!search) return options
    const q = search.toLowerCase()
    return options.filter((o) =>
      o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    )
  }, [options, search, needsSearchGate])

  const limited = React.useMemo(() => filtered.slice(0, maxItemsToRender), [filtered, maxItemsToRender])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          {/* <span className={cn(truncateLabel ? "truncate" : "whitespace-normal break-words text-left")}> */}
          <span className="truncate">
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent style={{ width: "var(--radix-popover-trigger-width)" }} className="p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} onValueChange={setSearch} />
          <CommandList ref={listRef}>
            <CommandEmpty>
              {needsSearchGate
                ? `Type at least ${minSearchChars} characters to search ${options.length} options...`
                : noResultsText}
            </CommandEmpty>
            <CommandGroup>
              {limited.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
