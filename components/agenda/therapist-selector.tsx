"use client";

import { getInitials, THERAPIST_ROLE_LABEL, type PublicCollaborator } from "../../lib/therapists";

/** Avatar circular del terapeuta: foto pública o iniciales como respaldo. */
export function TherapistAvatar({
  person,
  size = 44,
  className = "",
}: {
  person: Pick<PublicCollaborator, "name" | "avatarUrl">;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-[#C5A059]/45 bg-papyrus-warm font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-[.06em] text-bronze ${className}`}
    >
      {person.avatarUrl ? (
        // Imagen local del equipo: sin optimizador para no depender del dominio.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.avatarUrl} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        getInitials(person.name)
      )}
    </span>
  );
}

/**
 * FASE 1 · Paso "¿Con quién deseas tu sesión?".
 *
 * Radio buttons con avatar sobre la tarjeta del calendario. La selección es
 * obligatoria: cada terapeuta tiene su propia agenda, así que `value` apunta
 * siempre a una persona del equipo (solo es `null` mientras carga o si la
 * lista viene vacía, en cuyo caso la agenda muestra la disponibilidad general).
 */
export function TherapistSelector({
  collaborators,
  value,
  onChange,
  loading = false,
  error = null,
}: {
  collaborators: readonly PublicCollaborator[];
  value: string | null;
  onChange: (id: string | null) => void;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <section aria-labelledby="therapist-selector-heading" className="relative mt-6 border-t border-[#C5A059]/30 pt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id="therapist-selector-heading"
          className="font-[family-name:var(--font-montserrat)] text-[10px] font-bold uppercase tracking-[.22em] text-[#1A1A1A]"
        >
          ¿Con quién deseas tu sesión?
        </h2>
        <p className="font-[family-name:var(--font-montserrat)] text-[10px] text-[#5B5143]">
          {loading
            ? "Cargando al equipo…"
            : value
              ? "Los horarios se muestran solo para esta agenda."
              : "Elige una agenda para ver sus horarios."}
        </p>
      </div>

      {loading ? (
        <div aria-busy="true" className="mt-3 flex gap-2.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[70px] w-[150px] animate-pulse rounded-2xl border border-stone-200 bg-papyrus-light" />
          ))}
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-labelledby="therapist-selector-heading"
          className="mt-3 flex snap-x gap-2.5 overflow-x-auto overscroll-x-contain pb-1.5"
        >
          {collaborators.map((person) => {
            const selected = value === person.id;
            return (
              <label
                key={person.id}
                className={`flex min-w-[168px] cursor-pointer snap-start items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-bronze ${
                  selected
                    ? "border-gold bg-gold/15 text-ink shadow-[0_10px_24px_-16px_rgba(197,160,89,.6)]"
                    : "border-stone-200 bg-white text-ink hover:border-gold/60 hover:bg-papyrus-light"
                }`}
              >
                <input
                  type="radio"
                  name="agenda-therapist"
                  value={person.id}
                  checked={selected}
                  onChange={() => onChange(person.id)}
                  className="peer sr-only"
                />
                <TherapistAvatar person={person} size={38} className={selected ? "border-[#805F2B]/60" : ""} />
                <span className="min-w-0">
                  <span className="block truncate font-cormorant text-base leading-tight text-[#1A1A1A]">{person.name}</span>
                  <span className="mt-0.5 block font-[family-name:var(--font-montserrat)] text-[8px] font-semibold uppercase tracking-[.15em] text-[#805F2B]">
                    {THERAPIST_ROLE_LABEL[person.role]}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`ml-auto size-2.5 shrink-0 rounded-full border transition ${
                    selected ? "border-[#805F2B] bg-[#C5A059]" : "border-[#C5A059]/50 bg-transparent"
                  }`}
                />
              </label>
            );
          })}
        </div>
      )}

      {(error || (!loading && collaborators.length === 0)) && (
        <p role="status" className="mt-2 text-[10px] leading-4 text-[#5B5143]">
          {error ?? "Aún no hay terapeutas activos: mostramos la disponibilidad general."}
        </p>
      )}
    </section>
  );
}
