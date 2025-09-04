
// Собираем все JSON-файлы из папки в один массив.
// Работает при dev и в проде — роли «вшиваются» в бандл.
export const embeddedRoles = (() => {
  const modules = import.meta.glob('./*.json', { eager: true });
  return Object.values(modules).map(m => m.default);
})();
