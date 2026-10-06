export type SignatureIdentity = string;
export type CryptographicKeyPair = { publicKeyId: string; privateKeyId: string; algorithm: string };
export type FileHash = string;
export type DigitalSignature = { signatureId: string; keyPair: CryptographicKeyPair; timestamp: string };
export type VerificationRecord = { recordId: string; fileHash: FileHash; digitalSignature: DigitalSignature; verifiedAt: string; status: "valid" | "invalid" | "revoked" };
export type RevocationStatus = "active" | "revoked";
export type Expiration = { expiresAt: string | null; usageLimit: number | null };
export type FutureSignedFile = { fileId: string; hash: FileHash; signature: DigitalSignature; timestamp: string; verification: VerificationRecord; revocation: RevocationStatus; expiration: Expiration };
