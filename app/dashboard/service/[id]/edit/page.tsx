import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditServiceClient from './EditServiceClient'

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: service } = await supabase.from('services').select('*').eq('id', id).single()

  if (!service) notFound()
  // Agent hanya boleh edit jasa miliknya sendiri
  if (service.agent_id !== user?.id) redirect('/dashboard/services')

  return <EditServiceClient service={service} />
}
