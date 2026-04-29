import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function PageStub({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children?: ReactNode
}) {
  return (
    <main className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-2xl mx-auto">
        <Link to="/village" className="text-sm text-purple-600 hover:underline">← village</Link>
        <h1 className="text-3xl font-bold mt-4">{title}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">{children}</div>
      </div>
    </main>
  )
}
