
import { getDomainContent } from '@/lib/queries'
import { notFound } from 'next/navigation'
import React from 'react'

const Page = async ({
  params,
}: {
  params: { domain: string; path: string }
}) => {
  const domainData = await getDomainContent(params.domain.slice(0, -1))
  const pageData = domainData?.FunnelPages.find(
    (page) => page.pathName === params.path
  )

  if (!pageData || !domainData) return notFound()

}

export default Page