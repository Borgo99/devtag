import type { CSSProperties } from "react";
import type { StackGroup } from "@/lib/types";
import { StackList } from "./StackList";
import s from "./Stack.module.css";

export function Stack({ groups }: { groups: StackGroup[] }) {
  return (
    <dl className={s.groups}>
      {groups.map((group, i) => (
        <div key={group.group} className={`${s.row} reveal`} style={{ "--delay": `${i * 60}ms` } as CSSProperties}>
          <dt className={s.label}>{group.group}</dt>
          <dd className={s.items}>
            <StackList items={group.items} large />
          </dd>
        </div>
      ))}
    </dl>
  );
}
