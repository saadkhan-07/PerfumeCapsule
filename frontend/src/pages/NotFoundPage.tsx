import { Link } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'

export function NotFoundPage() {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-semibold tracking-tight">404 — Not Found</h1>
      <p className="mt-2 text-neutral-500">This page doesn’t exist.</p>
      <Link to="/" className="mt-4 inline-block text-sm font-medium text-neutral-900 underline">
        Back to home
      </Link>
    </PageWrapper>
  )
}
