export const roleMap = {
  '1': { name: 'Guard', title: 'Въезд / Выезд транспорта' },
  '2': { name: 'Dispatcher', title: 'Оформление пропуска' },
  '3': { name: 'Admin', title: 'Администрирование' }
}

export function getRoleByToken(token) {
  return roleMap[token] || null
}
