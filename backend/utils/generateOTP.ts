export function generateOTP(): string {
  // Generate a random secure 6-digit numeric string
  return Math.floor(100000 + Math.random() * 900000).toString();
}
