/**
 * Helpers para el remitente de campañas.
 *
 * El dominio/correo real NO se configura en el frontend: sale de MAIL_FROM
 * en el backend (Nest), consultado vía GET /mail/status (ver hook
 * useMailStatus). Esto evita que el frontend "invente" un dominio que no
 * coincida con el que realmente usa Resend al enviar.
 */

/** Extrae el email de un string tipo "Nombre <email@dominio.com>" o "email@dominio.com" */
export function extractEmail(from: string): string {
  const match = from.match(/<([^>]+)>/)
  return match ? match[1] : from
}

/** Extrae el dominio (parte después del @) de un remitente resuelto */
export function extractDomain(from: string): string {
  const email = extractEmail(from)
  return email.split('@')[1] ?? email
}

/** Arma un email de remitente a partir de un nombre libre + el dominio configurado en el backend */
export function buildFromEmail(fromName: string, domain: string): string {
  const alias = fromName
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-z0-9]+/g, '') || 'info'

  return `${alias}@${domain}`
}
