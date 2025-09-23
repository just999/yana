'use server';

import type { RangeTime } from '@/app/(site)/dashboard/expense/components/range';
import { auth } from '@/auth';
import { PAGE_SIZE } from '@/lib/constants';
import { db } from '@/lib/db';
import {
  expenseSchema,
  updateExpenseSchema,
  type ExpenseSchema,
  type UpdateExpenseSchema,
} from '@/lib/schemas/expense-schema';
import { formatError, getDateRangeForPeriod } from '@/lib/utils';
import type { Transaction, TransType } from '@prisma/client';
import {
  addDays,
  differenceInDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';

export async function getTransactionByUserId() {
  try {
    const session = await auth();
    if (!session) {
      return {
        error: false,
        message: 'unauthorized',
      };
    }
    const userId = session?.user.id;

    const trans = await db.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date('2025-09-15'),
          lte: new Date('2025-09-22'),
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (!trans) {
      return {
        error: true,
        message: 'user no have any transaction',
      };
    }

    return {
      error: false,
      message: 'Successfully fetch transaction',
      data: trans,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
}
export async function getTransactionById(id: string) {
  try {
    const session = await auth();
    if (!session) {
      return {
        error: false,
        message: 'unauthorized',
      };
    }
    const userId = session?.user.id;

    const trans = await db.transaction.findFirst({
      where: { id },
    });

    if (!trans) {
      return {
        error: true,
        message: 'user no have any transaction',
      };
    }

    return {
      error: false,
      message: 'Successfully fetch transaction',
      data: trans,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
}

export async function addNewTransaction(data: ExpenseSchema) {
  try {
    const session = await auth();
    if (!session) {
      return {
        error: false,
        message: 'unauthorized',
      };
    }
    const userId = session?.user.id;

    const validated = expenseSchema.safeParse(data);

    if (!validated.success) {
      return {
        error: true,
        errors: validated.error.flatten().fieldErrors,
        message: 'validated error',
        inputs: data,
      };
    }

    const trans = await db.transaction.create({
      data: {
        type: validated.data.type,
        category: validated.data.category ? validated.data.category : undefined,
        amount: validated.data.amount,
        date: new Date(validated.data.date).toISOString(),
        description: validated.data.description
          ? validated.data.description
          : '',
        userId,
      },
    });

    return {
      error: false,
      message: 'Successfully fetch transaction',
      data: trans,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
}
export async function editTransaction(data: UpdateExpenseSchema) {
  try {
    const session = await auth();
    if (!session) {
      return {
        error: false,
        message: 'unauthorized',
      };
    }
    const userId = session?.user.id;

    const validated = updateExpenseSchema.safeParse(data);

    if (!validated.success) {
      return {
        error: true,
        errors: validated.error.flatten().fieldErrors,
        message: 'validated error',
        inputs: data,
      };
    }

    const trans = await db.transaction.update({
      where: {
        id: validated.data.id,
      },
      data: {
        type: validated.data.type,
        category: validated.data.category ? validated.data.category : undefined,
        amount: validated.data.amount,
        date: new Date(validated.data.date).toISOString(),
        description: validated.data.description
          ? validated.data.description
          : '',
        userId,
      },
    });

    return {
      error: false,
      message: 'Successfully update transaction',
      data: trans,
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
}

export async function removeExpense(id: string) {
  try {
    const session = await auth();
    if (!session) {
      return {
        error: false,
        message: 'unauthorized',
      };
    }
    const userId = session?.user.id;

    const trans = await db.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!trans) {
      return {
        error: true,
        message: 'something went wrong',
      };
    }

    await db.transaction.delete({
      where: {
        id: trans.id,
      },
    });

    return {
      error: false,
      message: 'successfully remove transactions',
    };
  } catch (err) {
    return {
      error: true,
      message: formatError(err),
    };
  }
}

export type RangeType = 'today' | 'w' | 'm' | 'y';
type TransactionType = 'INCOME' | 'EXPENSE' | 'SAVING' | 'INVESTMENT' | null;

interface CalculateTotalResult {
  currentAmount: number;
  previousAmount: number;
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
}

interface DateRange {
  start: Date;
  end: Date;
}

// Helper function to calculate date ranges
// function getDateRanges(range: RangeType): {
//   current: DateRange;
//   previous: DateRange;
// } {
//   const now = new Date();
//   let currentStart: Date;
//   let currentEnd: Date;

//   // Calculate current period start based on range
//   // Calculate current period based on range
//   switch (range) {
//     case 'today':
//       // Today: from start of today to now
//       currentStart = new Date(now);
//       currentStart.setHours(0, 0, 0, 0); // Start of today
//       currentEnd = new Date(now);
//       break;

//     case 'w':
//       // Last 7 days: from 7 days ago to now
//       // currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//       // currentStart.setHours(0, 0, 0, 0);

//       // currentEnd = new Date(now);
//       // currentEnd.setHours(23, 59, 59, 999);

//       currentStart = startOfDay(subDays(now, 7));
//       currentEnd = endOfDay(now);
//       break;

//     case 'm':
//       // Last 30 days: from 30 days ago to now
//       currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//       currentEnd = new Date(now);
//       break;

//     case 'y':
//       // Last 365 days: from 365 days ago to now
//       currentStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
//       currentEnd = new Date(now);
//       break;

//     default:
//       currentStart = new Date(now);
//       currentStart.setHours(0, 0, 0, 0);
//       currentEnd = new Date(now);
//   }

//   // Calculate previous period
//   const periodDuration = currentEnd.getTime() - currentStart.getTime();
//   const previousEnd = new Date(currentStart.getTime() - 1); // 1ms before current start
//   const previousStart = new Date(currentStart.getTime() - periodDuration);

//   return {
//     current: { start: currentStart, end: currentEnd },
//     previous: { start: previousStart, end: previousEnd },
//   };
// }

// function getDateRanges(range: RangeType): {
//   current: DateRange;
//   previous: DateRange;
// } {
//   const now = new Date();
//   let currentStart: Date;
//   let currentEnd: Date;

//   switch (range) {
//     case 'today':
//       currentStart = startOfDay(now);
//       currentEnd = startOfDay(now); // Since DB dates are midnight, end is also midnight
//       break;

//     case 'w':
//       currentStart = startOfDay(startOfWeek(now, { weekStartsOn: 1 }));
//       // currentEnd = startOfDay(endOfWeek(now, { weekStartsOn: 0 }));
//       currentEnd = endOfWeek(now, { weekStartsOn: 1 });
//       break;

//     case 'm':
//       currentStart = startOfDay(startOfMonth(now));
//       currentEnd = startOfDay(endOfMonth(now));
//       break;

//     case 'y':
//       currentStart = startOfDay(startOfYear(now));
//       currentEnd = startOfDay(endOfYear(now));
//       break;

//     default:
//       currentStart = startOfDay(now);
//       currentEnd = startOfDay(now);
//   }

//   // Calculate previous period
//   const periodDuration = currentEnd.getTime() - currentStart.getTime();
//   const previousEnd = new Date(currentStart.getTime() - 86400000); // 1 day before current start
//   const previousStart = new Date(currentStart.getTime() - periodDuration);

//   return {
//     current: { start: currentStart, end: currentEnd },
//     previous: { start: previousStart, end: previousEnd },
//   };
// }

function getDateRanges(range: RangeType): {
  current: DateRange;
  previous: DateRange;
} {
  const now = new Date();
  let currentStart: Date;
  let currentEnd: Date;
  let previousStart: Date;
  let previousEnd: Date;

  // console.log('🥑 Input date (now):', now.toString());

  switch (range) {
    case 'today': {
      // Current: today (start and end of today)
      currentStart = startOfDay(now);
      currentEnd = endOfDay(now);

      // Previous: yesterday
      previousStart = startOfDay(subDays(now, 1));
      previousEnd = endOfDay(subDays(now, 1));
      break;
    }

    case 'w': {
      // Current: this week (Monday to Sunday)
      currentStart = startOfDay(startOfWeek(now, { weekStartsOn: 0 }));
      currentEnd = startOfDay(endOfWeek(now, { weekStartsOn: 0 }));

      // Previous: last week
      const lastWeek = subWeeks(now, 1);
      previousStart = startOfDay(startOfWeek(lastWeek, { weekStartsOn: 1 }));
      previousEnd = startOfDay(endOfWeek(lastWeek, { weekStartsOn: 1 }));
      break;
    }

    case 'm': {
      // Current: this month
      currentStart = startOfDay(startOfMonth(now));
      currentEnd = startOfDay(endOfMonth(now));

      // Previous: last month
      const lastMonth = subMonths(now, 1);
      previousStart = startOfDay(startOfMonth(lastMonth));
      previousEnd = startOfDay(endOfMonth(lastMonth));
      break;
    }

    case 'y': {
      // Current: this year
      currentStart = startOfDay(startOfYear(now));
      currentEnd = startOfDay(endOfYear(now));

      // Previous: last year
      const lastYear = subYears(now, 1);
      previousStart = startOfDay(startOfYear(lastYear));
      previousEnd = startOfDay(endOfYear(lastYear));
      break;
    }

    default: {
      currentStart = startOfDay(now);
      currentEnd = startOfDay(now);
      previousStart = startOfDay(subDays(now, 1));
      previousEnd = startOfDay(subDays(now, 1));
    }
  }

  const result = {
    current: { start: currentStart, end: currentEnd },
    previous: { start: previousStart, end: previousEnd },
  };

  // console.log(`🥑 Date ranges for ${range}:`, {
  //   current: {
  //     start: currentStart.toISOString(),
  //     end: currentEnd.toISOString(),
  //     startLocal: currentStart.toString(),
  //     endLocal: currentEnd.toString(),
  //   },
  //   previous: {
  //     start: previousStart.toISOString(),
  //     end: previousEnd.toISOString(),
  //     startLocal: previousStart.toString(),
  //     endLocal: previousEnd.toString(),
  //   },
  // });

  return result;
}

// FIXED: Main server action with better error handling and logging
export async function calculateTotal(
  rangeArg: RangeType = 'today',
  typeArg: TransactionType = null,
  userId?: string
): Promise<CalculateTotalResult> {
  try {
    const { current, previous } = getDateRanges(rangeArg);

    // Build the base where condition
    const baseWhereCondition: any = {};

    if (typeArg) {
      baseWhereCondition.type = typeArg;
    }

    if (userId) {
      baseWhereCondition.userId = userId;
    }

    // FIXED: Check if your date field is actually called 'createdAt'
    // It might be 'date' instead based on your schema
    const currentWhereCondition = {
      ...baseWhereCondition,
      // Try both field names - use the one that matches your Prisma schema
      date: {
        // or 'date' if that's your field name
        gte: current.start,
        lt: addDays(current.end, 1),
      },
    };

    const previousWhereCondition = {
      ...baseWhereCondition,
      date: {
        // or 'date' if that's your field name
        gte: previous.start,
        lt: addDays(current.end, 1),
      },
    };

    // Get current period sum
    const currentResult = await db.transaction.aggregate({
      where: currentWhereCondition,
      _sum: {
        amount: true,
      },
    });

    // Get previous period sum
    const previousResult = await db.transaction.aggregate({
      where: previousWhereCondition,
      _sum: {
        amount: true,
      },
    });

    // FIXED: Convert Decimal/BigInt to number properly
    const currentAmount = Number(currentResult._sum.amount || 0);
    const previousAmount = Number(previousResult._sum.amount || 0);

    // DEBUGGING: Let's also count the records to see if date filtering works
    const currentCount = await db.transaction.count({
      where: currentWhereCondition,
    });

    const previousCount = await db.transaction.count({
      where: previousWhereCondition,
    });

    // Let's also get some sample records to debug
    const sampleCurrentRecords = await db.transaction.findMany({
      where: currentWhereCondition,
      take: 3,
      select: {
        id: true,
        amount: true,
        date: true, // or 'date'
        type: true,
      },
    });

    const samplePreviousRecords = await db.transaction.findMany({
      where: previousWhereCondition,
      take: 3,
      select: {
        id: true,
        amount: true,
        date: true, // or 'date'
        type: true,
      },
    });

    return {
      currentAmount,
      previousAmount,
      currentStart: current.start,
      currentEnd: current.end,
      previousStart: previous.start,
      previousEnd: previous.end,
    };
  } catch (error) {
    console.error('❌ Error calculating totals:', error);
    throw new Error('Failed to calculate totals: ' + (error as Error).message);
  }
}

// Alternative version with more detailed breakdown
// export async function calculateTotalDetailed(
//   rangeArg: RangeType = 'today',
//   typeArg: TransactionType = null,
//   userId?: string
// ) {
//   console.log('🔍 calculateTotalDetailed started:', {
//     rangeArg,
//     typeArg,
//     userId,
//   });
//   const startTime = performance.now();
//   try {
//     const { current, previous } = getDateRanges(rangeArg);

//     const baseWhereCondition = {
//       ...(typeArg && { type: typeArg }),
//       ...(userId && { userId }),
//     };
//     console.log('⏳ Starting current data query...');
//     // Get current period data with grouping
//     const currentData = await db.transaction.groupBy({
//       by: ['type'],
//       where: {
//         ...baseWhereCondition,
//         createdAt: {
//           gte: current.start,
//           lte: current.end,
//         },
//       },
//       _sum: {
//         amount: true,
//       },
//       _count: {
//         _all: true,
//       },
//     });
//     console.log('✅ Current data loaded:', currentData);

//     console.log('⏳ Starting previous data query...');
//     // Get previous period data with grouping
//     const previousData = await db.transaction.groupBy({
//       by: ['type'],
//       where: {
//         ...baseWhereCondition,
//         createdAt: {
//           gte: previous.start,
//           lte: previous.end,
//         },
//       },
//       _sum: {
//         amount: true,
//       },
//       _count: {
//         _all: true,
//       },
//     });
//     console.log('✅ Previous data loaded:', previousData);
//     // Calculate totals
//     const currentAmount = currentData.reduce(
//       (sum, item) => sum + (item._sum.amount ?? 0),
//       0
//     );

//     const previousAmount = previousData.reduce(
//       (sum, item) => sum + (item._sum.amount ?? 0),
//       0
//     );

//     // Calculate percentage change
//     const percentageChange =
//       previousAmount !== 0
//         ? ((currentAmount - previousAmount) / previousAmount) * 100
//         : currentAmount > 0
//           ? 100
//           : 0;
//     const endTime = performance.now();
//     console.log(`⚡ Query completed in ${endTime - startTime}ms`);
//     return {
//       currentAmount,
//       previousAmount,
//       percentageChange,
//       currentData,
//       previousData,
//       currentStart: current.start,
//       currentEnd: current.end,
//       previousStart: previous.start,
//       previousEnd: previous.end,
//     };
//   } catch (error) {
//     console.error('Error calculating detailed totals:', error);
//     throw new Error('Failed to calculate detailed totals');
//   }
// }

// export async function calculateTotalDetailed(
//   rangeArg: RangeType = 'today',
//   typeArg: TransactionType = null,
//   userId?: string
// ) {
//   // console.log('🔍 calculateTotalDetailed started:', {
//   //   rangeArg,
//   //   typeArg,
//   //   userId,
//   // });
//   const startTime = performance.now();

//   try {
//     // Your existing code...
//     const { current, previous } = getDateRanges(rangeArg);

//     const baseWhereCondition = {
//       ...(typeArg && { type: typeArg }),
//       ...(userId && { userId }),
//     };

//     // Execute queries in parallel
//     const [currentData, previousData] = await Promise.all([
//       db.transaction.groupBy({
//         by: ['type'],
//         where: {
//           ...baseWhereCondition,
//           date: {
//             gte: current.start,
//             lt: addDays(current.end, 1),
//           },
//         },
//         _sum: {
//           amount: true,
//         },
//         _count: {
//           _all: true,
//         },
//       }),
//       db.transaction.groupBy({
//         by: ['type'],
//         where: {
//           ...baseWhereCondition,
//           date: {
//             gte: previous.start,
//             lt: addDays(current.end, 1),
//           },
//         },
//         _sum: {
//           amount: true,
//         },
//         _count: {
//           _all: true,
//         },
//       }),
//     ]);

//     // Ensure minimum loading time for skeleton visibility
//     const elapsed = performance.now() - startTime;
//     const minLoadingTime = 300; // 300ms minimum

//     if (elapsed < minLoadingTime) {
//       await new Promise((resolve) =>
//         setTimeout(resolve, minLoadingTime - elapsed)
//       );
//       // console.log(`⏰ Added ${minLoadingTime - elapsed}ms delay for UX`);
//     }

//     // Rest of your calculation logic...
//     const currentAmount = currentData.reduce(
//       (sum, item) => sum + (item._sum.amount ?? 0),
//       0
//     );

//     const previousAmount = previousData.reduce(
//       (sum, item) => sum + (item._sum.amount ?? 0),
//       0
//     );

//     const percentageChange =
//       previousAmount !== 0
//         ? ((currentAmount - previousAmount) / previousAmount) * 100
//         : currentAmount > 0
//           ? 100
//           : 0;

//     const endTime = performance.now();
//     console.log(`⚡ Total time with delay: ${endTime - startTime}ms`);

//     return {
//       currentAmount,
//       previousAmount,
//       percentageChange,
//       currentData,
//       previousData,
//       currentStart: current.start,
//       currentEnd: current.end,
//       previousStart: previous.start,
//       previousEnd: previous.end,
//     };
//   } catch (error) {
//     console.error('Error calculating detailed totals:', error);
//     throw new Error('Failed to calculate detailed totals');
//   }
// }

export async function calculateTotalDetailed(
  rangeArg: RangeType = 'today',
  typeArg: TransactionType = null,
  userId?: string
) {
  const startTime = performance.now();

  try {
    const { current, previous } = getDateRanges(rangeArg);

    // console.log('🥑 Date ranges for midnight DB dates:', {
    //   current: {
    //     start: current.start,
    //     end: current.end,
    //   },
    //   previous: {
    //     start: previous.start,
    //     end: previous.end,
    //   },
    // });

    const baseWhereCondition = {
      ...(typeArg && { type: typeArg }),
      ...(userId && { userId }),
    };

    // FIXED: Proper handling for midnight dates
    const [currentData, previousData] = await Promise.all([
      db.transaction.groupBy({
        by: ['type'],
        where: {
          ...baseWhereCondition,
          date: {
            gte: current.start,
            lte: current.end,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      }),
      db.transaction.groupBy({
        by: ['type'],
        where: {
          ...baseWhereCondition,
          date: {
            gte: previous.start,
            lte: previous.end,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    // Rest of your existing code...
    const currentAmount = currentData.reduce(
      (sum, item) => sum + (item._sum.amount ?? 0),
      0
    );

    const previousAmount = previousData.reduce(
      (sum, item) => sum + (item._sum.amount ?? 0),
      0
    );

    const percentageChange =
      previousAmount !== 0
        ? ((currentAmount - previousAmount) / previousAmount) * 100
        : currentAmount > 0
          ? 100
          : 0;

    // Ensure minimum loading time for skeleton visibility
    const elapsed = performance.now() - startTime;
    const minLoadingTime = 300;

    if (elapsed < minLoadingTime) {
      await new Promise((resolve) =>
        setTimeout(resolve, minLoadingTime - elapsed)
      );
    }

    // const endTime = performance.now();
    // console.log(`⚡ Total time with delay: ${endTime - startTime}ms`);

    return {
      currentAmount,
      previousAmount,
      percentageChange,
      currentData,
      previousData,
      currentStart: current.start,
      currentEnd: current.end,
      previousStart: previous.start,
      previousEnd: previous.end,
    };
  } catch (error) {
    console.error('Error calculating detailed totals:', error);
    throw new Error('Failed to calculate detailed totals');
  }
}

// Version for specific user with authentication
export async function calculateUserTotal(
  userId: string,
  rangeArg: RangeType = 'today',
  typeArg: TransactionType = null
) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return calculateTotal(rangeArg, typeArg, userId);
}

// Usage in a React Server Component or API route
export async function getTotalsByRange(
  range: RangeType,
  type?: TransactionType,
  userId?: string
) {
  try {
    const result = await calculateTotal(range, type, userId);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export interface TransactionResult {
  success: boolean;
  data?: Transaction[];
  totalCount?: number;
  totalAmount?: number;
  dateRange?: { start: Date; end: Date };
  pagination?: {
    offset: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalPages: number;
    currentPage: number;
    returnedCount: number;
  };
  message?: string;
  error?: string;
}

export async function getTransactionByRange(
  range: RangeTime,
  offset?: number,
  limit?: number
): Promise<TransactionResult> {
  // if (process.env.NODE_ENV === 'development') {
  //   await new Promise((resolve) => setTimeout(resolve, 10000));
  // }

  try {
    const session = await auth();
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
        message: 'Please log in to view transactions',
      };
    }

    const userId = session.user.id;
    const { start, end } = getDateRangeForPeriod(range);

    const pageOffset = offset ?? 0;
    const pageLimit = limit ?? 4;

    const whereClause = {
      userId: userId,
      date: {
        gte: start,
        lte: end,
      },
    };

    // Query transactions in the date range
    // const transactions = await db.transaction.findMany({
    //   where: {
    //     userId: userId,
    //     date: {
    //       // or 'date' - check your schema
    //       gte: start,
    //       lte: end,
    //     },
    //   },
    //   orderBy: {
    //     createdAt: 'desc',
    //   },
    // });

    // Use Promise.all to run queries in parallel
    const [transactions, totalCount, aggregation] = await Promise.all([
      // Get paginated transactions
      db.transaction.findMany({
        where: whereClause,
        orderBy: {
          date: 'desc',
        },
        skip: pageOffset,
        take: pageLimit,
      }),

      // Get total count
      db.transaction.count({
        where: whereClause,
      }),

      // Get total amount using aggregation (more efficient)
      db.transaction.aggregate({
        where: whereClause,
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalAmount = Number(aggregation._sum.amount) || 0;

    // Calculate pagination metadata
    const hasNextPage = pageOffset + pageLimit < totalCount;
    const hasPreviousPage = pageOffset > 0;
    const totalPages = Math.ceil(totalCount / pageLimit);
    const currentPage = Math.floor(pageOffset / pageLimit) + 1;
    return {
      success: true,
      data: transactions,
      totalCount,
      totalAmount,
      dateRange: { start, end },
      pagination: {
        offset: pageOffset,
        limit: pageLimit,
        hasNextPage,
        hasPreviousPage,
        totalPages,
        currentPage,
        returnedCount: transactions.length,
      },
      message: `Found ${totalCount} transactions for ${range} (${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}). Showing ${transactions.length} results (page ${currentPage} of ${totalPages})`,
    };
  } catch (err) {
    console.error('Error fetching transactions by range:', err);
    return {
      success: false,
      error: formatError(err),
    };
  }
}

// SOLUTION 5: Advanced filtering with date-fns helpers
export async function getTransactionByRangeAdvanced(
  range: RangeTime,
  options?: {
    includeWeekends?: boolean;
    timezone?: string;
    groupBy?: 'day' | 'week' | 'month';
  }
): Promise<TransactionResult & { groupedData?: any[] }> {
  try {
    const session = await auth();
    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const userId = session.user.id;
    const { start, end } = getDateRangeForPeriod(range);

    const transactions = await db.transaction.findMany({
      where: {
        userId: userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const totalAmount = transactions.reduce((sum, transaction) => {
      return sum + (Number(transaction.amount) || 0);
    }, 0);

    // Group data by specified period using date-fns
    let groupedData: any[] = [];

    if (options?.groupBy) {
      const groups = new Map();

      transactions.forEach((transaction) => {
        let groupKey: string;
        const transactionDate = new Date(transaction.date);

        switch (options.groupBy) {
          case 'day':
            groupKey = format(transactionDate, 'yyyy-MM-dd');
            break;
          case 'week':
            groupKey = format(startOfWeek(transactionDate), 'yyyy-MM-dd');
            break;
          case 'month':
            groupKey = format(transactionDate, 'yyyy-MM');
            break;
          default:
            groupKey = format(transactionDate, 'yyyy-MM-dd');
        }

        if (!groups.has(groupKey)) {
          groups.set(groupKey, {
            date: groupKey,
            transactions: [],
            totalAmount: 0,
            count: 0,
          });
        }

        const group = groups.get(groupKey);
        group.transactions.push(transaction);
        group.totalAmount += Number(transaction.amount) || 0;
        group.count++;
      });

      groupedData = Array.from(groups.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    return {
      success: true,
      data: transactions,
      totalCount: transactions.length,
      totalAmount,
      dateRange: { start, end },
      groupedData,
      message: `${transactions.length} transactions from ${format(start, 'PPP')} to ${format(end, 'PPP')}`,
    };
  } catch (err) {
    console.error('Error fetching advanced transactions:', err);
    return {
      success: false,
      error: formatError(err),
    };
  }
}

// SOLUTION 6: Comparison with previous period using date-fns
export async function getTransactionComparisonByRange(range: RangeTime) {
  try {
    const session = await auth();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;
    const { start: currentStart, end: currentEnd } =
      getDateRangeForPeriod(range);

    // Calculate previous period using date-fns
    const periodLength = differenceInDays(currentEnd, currentStart);
    const previousEnd = subDays(currentStart, 1); // 1 day before current period
    const previousStart = subDays(previousEnd, periodLength);

    console.log('📊 Comparison periods:', {
      current: `${format(currentStart, 'MMM dd')} - ${format(currentEnd, 'MMM dd')}`,
      previous: `${format(previousStart, 'MMM dd')} - ${format(previousEnd, 'MMM dd')}`,
    });

    // Get current period data
    const currentTransactions = await db.transaction.findMany({
      where: {
        userId,
        date: { gte: currentStart, lte: currentEnd },
      },
    });

    // Get previous period data
    const previousTransactions = await db.transaction.findMany({
      where: {
        userId,
        date: { gte: previousStart, lte: previousEnd },
      },
    });

    const currentAmount = currentTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );
    const previousAmount = previousTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

    const percentageChange =
      previousAmount !== 0
        ? ((currentAmount - previousAmount) / previousAmount) * 100
        : currentAmount > 0
          ? 100
          : 0;

    return {
      success: true,
      current: {
        amount: currentAmount,
        count: currentTransactions.length,
        period: `${format(currentStart, 'MMM dd')} - ${format(currentEnd, 'MMM dd')}`,
      },
      previous: {
        amount: previousAmount,
        count: previousTransactions.length,
        period: `${format(previousStart, 'MMM dd')} - ${format(previousEnd, 'MMM dd')}`,
      },
      change: {
        amount: currentAmount - previousAmount,
        percentage: percentageChange,
        trend:
          percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'same',
      },
    };
  } catch (err) {
    return { success: false, error: formatError(err) };
  }
}
