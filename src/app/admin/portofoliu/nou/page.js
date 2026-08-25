import { redirect } from 'next/navigation'

import ProjectForm from '@/components/admin/ProjectForm'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Container from '@/components/layout/Container'
import { canEditContent, getAdminCategories } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Proiect nou',
  robots: { index: false, follow: false },
}

export default async function NewProjectPage() {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  const categories = await getAdminCategories()

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Portofoliu', href: '/admin/portofoliu' },
          { label: 'Proiect nou', href: '/admin/portofoliu/nou' },
        ]}
      />

      <h1 className="mt-6 text-4xl">Proiect nou</h1>

      <div className="mt-10 max-w-4xl">
        <ProjectForm categories={categories} readOnly={!canEditContent()} />
      </div>
    </Container>
  )
}
