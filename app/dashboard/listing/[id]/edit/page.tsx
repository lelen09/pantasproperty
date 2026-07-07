import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditListingClient from './EditListingClient'

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (!listing) notFound()
  // Agent hanya boleh edit listing miliknya sendiri
  if (listing.agent_id !== user?.id) redirect('/dashboard')

  return <EditListingClient listing={listing} />
}
