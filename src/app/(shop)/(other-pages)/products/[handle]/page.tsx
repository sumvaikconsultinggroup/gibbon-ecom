import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ handle: string }>
}

// Redirect to the main products page
export default async function OldProductPage({ params }: Props) {
  const { handle } = await params
  redirect(`/products/${handle}`)
}
