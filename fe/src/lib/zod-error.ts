export function getSchemaErrorMessage(error: {
  issues: Array<{ message?: string }>
}) {
  return error.issues[0]?.message ?? 'Du lieu khong hop le'
}
