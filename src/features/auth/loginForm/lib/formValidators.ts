export function isEmailValid(email: string): boolean {
  return email.length > 5 && email.includes('@');
}
export function isPasswordValid(password: string): boolean {
  return password.length > 3;
}
export function isEmpty(input: string): boolean {
  return input.trim().length === 0;
}
