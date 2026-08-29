export function isoCalendarDate(date: Date): string { const p=(n:number)=>String(n).padStart(2,'0'); return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}`; }
export function ruDate(date: Date): string { const p=(n:number)=>String(n).padStart(2,'0'); return `${p(date.getDate())}.${p(date.getMonth()+1)}.${date.getFullYear()}`; }
