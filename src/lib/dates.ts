// El servidor (Railway) corre en UTC, pero los inputs <input type="date"> y
// <input type="datetime-local"> del formulario devuelven una fecha/hora "naive"
// (sin offset) que el usuario ingresó pensando en hora de Argentina. Si se le
// pasa esa cadena directo a `new Date(...)`, Node la interpreta como UTC, no
// como hora local del usuario, y el dato queda desfasado (ej: 9:00 se guarda
// como 6:00). Argentina no usa horario de verano desde 2009, así que el
// offset -03:00 es fijo todo el año y podemos aplicarlo a mano sin necesitar
// una librería de timezones.
const AR_OFFSET = "-03:00";

/** Convierte el valor de un <input type="datetime-local"> (ej: "2026-09-04T09:00"),
 * asumido en hora de Argentina, al Date UTC correcto para guardar en la base. */
export function parseLocalDateTime(value: string): Date {
  const hasSeconds = /:\d{2}:\d{2}$/.test(value);
  return new Date(`${value}${hasSeconds ? "" : ":00"}${AR_OFFSET}`);
}

/** Convierte el valor de un <input type="date"> (ej: "1998-05-20"), asumido
 * como fecha calendario en Argentina, al Date UTC correcto para guardar. */
export function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00${AR_OFFSET}`);
}
