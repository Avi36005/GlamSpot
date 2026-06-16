import Image from "next/image";
import { User } from "lucide-react";
import type { StaffDTO } from "@/lib/types";
import { Badge } from "./ui";

export function StaffCard({ staff }: { staff: StaffDTO }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-white p-5 text-center transition-shadow hover:shadow-[var(--shadow-card)]">
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-cream">
        {staff.avatarUrl ? (
          <Image src={staff.avatarUrl} alt={staff.name} fill sizes="80px" className="object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center text-muted">
            <User size={28} />
          </span>
        )}
      </div>
      <h4 className="mt-3 font-display text-base font-semibold text-ink">{staff.name}</h4>
      <Badge tone="rose" className="mt-1.5">
        {staff.specialisation}
      </Badge>
      {staff.bio && <p className="mt-2.5 text-sm leading-relaxed text-muted">{staff.bio}</p>}
    </div>
  );
}
