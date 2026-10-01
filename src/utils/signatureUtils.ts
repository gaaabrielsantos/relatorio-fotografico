import type { ReportSignature } from '../types/report'

export function hasSignatureContent(signature: ReportSignature): boolean {
  return Boolean(
    signature.name.trim() ||
      signature.role.trim() ||
      signature.registrationNumber.trim() ||
      signature.signatureImageDataUrl,
  )
}
