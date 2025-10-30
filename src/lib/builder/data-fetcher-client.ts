import type { DataBinding } from '@/types/builder';

/**
 * Client-side data fetching for runtime: 'client' mode
 * Uses browser Supabase client
 */
export async function fetchBoundDataClient<T = any>(
  binding: DataBinding | undefined
): Promise<{ data: T[] | null; error: string | null }> {
  if (!binding) {
    return { data: null, error: 'No data binding configured' };
  }

  try {
    // Dynamic import to avoid server-side issues
    const { supabaseBrowser } = await import('@/lib/supabase/client');
    const supabase = supabaseBrowser();

    // Start query with table and select
    let query = supabase
      .from(binding.table)
      .select(binding.select.join(', '));

    // Apply WHERE clauses
    if (binding.where && binding.where.length > 0) {
      binding.where.forEach(clause => {
        switch (clause.operator) {
          case 'eq':
            query = query.eq(clause.column, clause.value);
            break;
          case 'neq':
            query = query.neq(clause.column, clause.value);
            break;
          case 'gt':
            query = query.gt(clause.column, clause.value);
            break;
          case 'gte':
            query = query.gte(clause.column, clause.value);
            break;
          case 'lt':
            query = query.lt(clause.column, clause.value);
            break;
          case 'lte':
            query = query.lte(clause.column, clause.value);
            break;
          case 'like':
            query = query.like(clause.column, `%${clause.value}%`);
            break;
          case 'in':
            const inValues = Array.isArray(clause.value)
              ? clause.value
              : String(clause.value).split(',').map(v => v.trim());
            query = query.in(clause.column, inValues);
            break;
          default:
            console.warn(`Unknown operator: ${clause.operator}`);
        }
      });
    }

    // Apply ORDER BY clauses
    if (binding.orderBy && binding.orderBy.length > 0) {
      binding.orderBy.forEach(order => {
        query = query.order(order.column, { ascending: order.ascending });
      });
    }

    // Apply LIMIT
    if (binding.limit && binding.limit > 0) {
      query = query.limit(binding.limit);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return { data: null, error: error.message };
    }

    return { data: data as T[], error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Client data fetcher error:', errorMessage);
    return { data: null, error: errorMessage };
  }
}
