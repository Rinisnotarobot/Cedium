/**
 * 根据用户名生成稳定的头像背景颜色
 */
const avatarColors = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-orange-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-rose-500',
  'bg-indigo-500',
]

export function getAvatarColor(name: string): string {
  if (!name) return avatarColors[0]
  const index = name.charCodeAt(0) % avatarColors.length
  return avatarColors[index]
}