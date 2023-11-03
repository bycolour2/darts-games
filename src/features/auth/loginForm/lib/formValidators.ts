export function isEmailValid(email: string) {
  return email.length > 5 && email.includes('@');
}
export function isPasswordValid(password: string) {
  return password.length > 3;
}
export function isEmpty(input: string) {
  return input.trim().length === 0;
}
