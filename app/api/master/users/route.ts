import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const status = searchParams.get('status') || 'all'
    
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('users')
      .select(`
        *,
        sellers (
          business_name,
          is_verified,
          is_active,
          total_sales,
          total_products
        )
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    if (role === 'seller') {
      query = query.not('sellers', 'is', null)
    } else if (role === 'buyer') {
      query = query.is('sellers', null)
    }

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // Execute query with pagination
    const { data: users, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Get additional stats
    const { data: stats } = await supabase
      .from('users')
      .select('is_active')

    const activeUsers = stats?.filter(u => u.is_active).length || 0
    const inactiveUsers = stats?.filter(u => !u.is_active).length || 0

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: {
        total: count || 0,
        active: activeUsers,
        inactive: inactiveUsers
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update user
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    // If updating seller status
    if (updates.is_active !== undefined && data) {
      const { data: seller } = await supabase
        .from('sellers')
        .select('user_id')
        .eq('user_id', userId)
        .single()

      if (seller) {
        await supabase
          .from('sellers')
          .update({ is_active: updates.is_active })
          .eq('user_id', userId)
      }
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}