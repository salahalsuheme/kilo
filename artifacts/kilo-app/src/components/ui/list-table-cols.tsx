/** Shared 5-column widths for list tables (customers, users, …). */
export function ListTableColGroup() {
  return (
    <colgroup>
      <col style={{ width: "30%" }} />
      <col style={{ width: "18%" }} />
      <col style={{ width: "14%" }} />
      <col style={{ width: "18%" }} />
      <col style={{ width: "4rem" }} />
    </colgroup>
  );
}

/** 6-column widths for the vehicles list table. */
export function VehiclesTableColGroup() {
  return (
    <colgroup>
      <col style={{ width: "24%" }} />
      <col style={{ width: "10%" }} />
      <col style={{ width: "18%" }} />
      <col style={{ width: "12%" }} />
      <col style={{ width: "14%" }} />
      <col style={{ width: "4rem" }} />
    </colgroup>
  );
}
