import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<T>
  name: FieldPath<T>
  label: string
  placeholder?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            id={field.name}
            value={field.value ?? ''}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export function DateField<T extends FieldValues>({
  control,
  name,
  label,
}: {
  control: Control<T>
  name: FieldPath<T>
  label: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Popover>
            <PopoverTrigger>
              <Button className="w-full justify-between" variant="outline">
                <span
                  className={cn(
                    'truncate',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value
                    ? new Date(field.value).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Pick a date'}
                </span>
                <CalendarIcon
                  aria-hidden="true"
                  className="opacity-60 transition-opacity group-hover/pick-date:opacity-100"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                onSelect={(date) =>
                  field.onChange(
                    Array.isArray(date)
                      ? date[0]?.toISOString()
                      : date instanceof Date
                        ? date.toISOString()
                        : undefined,
                  )
                }
                selected={field.value ? new Date(field.value) : undefined}
              />
            </PopoverContent>
          </Popover>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    ></Controller>
  )
}

export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  step,
}: {
  control: Control<T>
  name: FieldPath<T>
  label: string
  placeholder?: string
  step?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            type="number"
            inputMode="decimal"
            step={step}
            placeholder={placeholder}
            id={field.name}
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value ?? ''}
            onChange={(e) =>
              field.onChange(
                e.target.value === '' ? undefined : e.target.valueAsNumber,
              )
            }
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<T>
  name: FieldPath<T>
  label: string
  placeholder?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Textarea
            {...field}
            id={field.name}
            value={field.value ?? ''}
            rows={3}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
}: {
  control: Control<T>
  name: FieldPath<T>
  label: string
  options: readonly string[]
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Select
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
              {field.value.charAt(0).toUpperCase() + field.value.slice(1)}
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o} value={o} className="capitalize">
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
