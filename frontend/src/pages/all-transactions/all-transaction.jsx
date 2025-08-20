import React, { useState, useMemo, useEffect } from 'react';
import TransactionNavbar from './transaction-navbar';
import { useLocation } from 'react-router';
import { useTracker } from '@/contexts/tracker-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Loader2
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const DATE_RANGES = {
  '7D': { label: 'Last 7 Days', days: 7 },
  '1M': { label: 'Last 30 Days', days: 30 },
  '3M': { label: 'Last 3 Months', days: 90 },
  '6M': { label: 'Last 6 Months', days: 180 },
  '1Y': { label: 'Last Year', days: 365 },
  'ALL': { label: 'All Time', days: null },
};

const categoryColors = {
  SALARY: '#22c55e',           
  BUSINESS: '#16a34a',         
  INVESTMENT: '#10b981',       
  FREELANCE: '#84cc16',        
  RENTAL: '#059669',           
  BONUS: '#06b6d4',            
  REFUND: '#0891b2',           
  GIFT: '#0d9488',             

  FOOD: '#f97316',             
  GROCERIES: '#f59e0b',        
  TRANSPORT: '#dc2626',        
  FUEL: '#ea580c',             
  BILLS: '#8b5cf6',            
  RENT: '#ef4444',             
  INSURANCE: '#6366f1',        
  HEALTHCARE: '#dc2626',       

  SHOPPING: '#ec4899',         
  CLOTHING: '#f472b6',         
  ENTERTAINMENT: '#a855f7',    
  EDUCATION: '#3b82f6',        
  TRAVEL: '#06b6d4',           
  FITNESS: '#10b981',          
  PERSONAL_CARE: '#f59e0b',    
  SUBSCRIPTIONS: '#8b5cf6',    

  SAVINGS: '#0ea5e9',          
  INVESTMENTS: '#1d4ed8',      
  LOAN_PAYMENT: '#1e40af',     
  CREDIT_CARD: '#3730a3',      
  BANK_FEES: '#4338ca',        
  TAXES: '#1e3a8a',            

  CHILDCARE: '#f472b6',        
  PET_CARE: '#84cc16',         
  CHARITY: '#22c55e',          
  GIFTS_GIVEN: '#ec4899',      

  HOME_IMPROVEMENT: '#a3a3a3', 
  MAINTENANCE: '#737373',      

  OTHER: '#6b7280',            
  default: '#6b7280',
};

const AllTransaction = () => {
  const location = useLocation();
  const accountData = location.state || {};
  const { accountName, accountType, accountBalance } = accountData;
  const { fetchTransactions } = useTracker();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('1M');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchTransactions();
        console.log();
        setTransactions(response.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch transactions');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000)
      : new Date(0);

    const filtered = transactions.filter((t) => {
      const tDate = new Date(t.date || t.created_at);
      return tDate >= startDate && tDate <= now;
    });

    const grouped = filtered.reduce((acc, transaction) => {
      const date = new Date(transaction.date || transaction.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }

      const amount = parseFloat(transaction.amount) || 0;
      if (transaction.type === 'INCOME' || transaction.transaction_type === 'income') {
        acc[date].income += amount;
      } else {
        acc[date].expense += amount;
      }

      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [dateRange, transactions]);

  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];

    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000)
      : new Date(0);

    let result = transactions.filter((t) => {
      const tDate = new Date(t.date || t.created_at);
      return tDate >= startDate && tDate <= now;
    });

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((t) => 
        (t.description || t.title || '').toLowerCase().includes(lower) ||
        (t.category || '').toLowerCase().includes(lower)
      );
    }

    if (typeFilter) {
      result = result.filter((t) => {
        const transactionType = t.type || t.transaction_type;
        if (typeFilter === 'INCOME') {
          return transactionType === 'INCOME' || transactionType === 'income';
        } else if (typeFilter === 'EXPENSE') {
          return transactionType === 'EXPENSE' || transactionType === 'expense';
        }
        return true;
      });
    }

    if (transactionTypeFilter) {
      if (transactionTypeFilter === 'RECURRING') {
        result = result.filter((t) => t.isRecurring === true || t.is_recurring === true);
      } else if (transactionTypeFilter === 'ONE_TIME') {
        result = result.filter((t) => t.isRecurring === false || t.is_recurring === false);
      }
    }

    return result.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
  }, [dateRange, searchTerm, typeFilter, transactionTypeFilter, transactions]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        const amount = parseFloat(t.amount) || 0;
        const transactionType = t.type || t.transaction_type;
        if (transactionType === 'INCOME' || transactionType === 'income') {
          acc.income += amount;
        } else {
          acc.expense += amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [filteredTransactions]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getCategoryColor = (category) => {
    if (!category) return categoryColors.default;
    const key = category.toUpperCase().replace(/\s+/g, '_');
    return categoryColors[key] || categoryColors.default;
  };

  const handleEdit = (transaction) => {
    console.log('Edit transaction:', transaction);
  };

  const handleDelete = (transaction) => {
    console.log('Delete transaction:', transaction);
  };

  const getTransactionType = (transaction) => {
    return transaction.type || transaction.transaction_type || 'EXPENSE';
  };

  const getTransactionDescription = (transaction) => {
    return transaction.description || transaction.title || 'No description';
  };

  const getTransactionCategory = (transaction) => {
    return transaction.category || transaction.description || transaction.title || 'OTHER';
  };

  const isRecurringTransaction = (transaction) => {
    return transaction.isRecurring || transaction.is_recurring || false;
  };

  if (loading) {
    return (
      <>
        <TransactionNavbar />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className='animate-spin h-6 w-6 mx-auto' />
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TransactionNavbar />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error: {error}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TransactionNavbar />

      <div className="container mx-auto px-4 py-6">
        <>
        {/* This part */}
                {(accountName || accountType || accountBalance) && (
            <div className="bg-card border rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  {accountName && (
                    <h1 className="text-3xl font-semibold capitalize text-blue-500">{accountName}</h1>
                  )}
                  {accountType && (
                    <p className="text-muted-foreground mt-1">{accountType} Account</p>
                  )}
                </div>
                <div className="text-right">
                  {accountBalance && (
                    <p className="text-3xl font-bold text-foreground">
                      ${parseFloat(accountBalance || 0).toFixed(2)}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">{transactions.length} Transactions</p>
                </div>
              </div>
            </div>
          )}

          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <CardTitle className="text-lg font-semibold">Transaction Overview</CardTitle>
              <Select defaultValue={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Income</p>
                  <p className="text-2xl font-bold text-green-500">${totals.income.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-500">${totals.expense.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Net</p>
                  <p
                    className={`text-2xl font-bold ${
                      totals.income - totals.expense >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    ${(totals.income - totals.expense).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value}`, undefined]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">All Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8"
                  />
                </div>
                
                <Select
                  value={typeFilter}
                  onValueChange={(value) => {
                    setTypeFilter(value === 'ALL' ? '' : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={transactionTypeFilter}
                  onValueChange={(value) => {
                    setTransactionTypeFilter(value === 'ALL' ? '' : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Transaction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="RECURRING">Recurring</SelectItem>
                    <SelectItem value="ONE_TIME">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px] text-center">Date</TableHead>
                      <TableHead className="w-[200px] text-center">Description</TableHead>
                      <TableHead className="w-[150px] text-center">Category</TableHead>
                      <TableHead className="w-[120px] text-center">Amount</TableHead>
                      <TableHead className="w-[130px] text-center">Type</TableHead>
                      <TableHead className="w-[60px] text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTransactions.map((transaction, index) => (
                        <TableRow key={transaction.id || index} className="hover:bg-muted/50">
                          <TableCell className="w-[120px] text-center">
                            {new Date(transaction.date || transaction.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: '2-digit',
                            })}
                          </TableCell>
                          
                          <TableCell className="w-[200px] text-center">
                            <div className="truncate" title={getTransactionDescription(transaction)}>
                              {getTransactionDescription(transaction)}
                            </div>
                          </TableCell>
                          
                          <TableCell className="w-[150px] text-center">
                            <div className="flex justify-center">
                              <Badge
                                style={{
                                  backgroundColor: getCategoryColor(getTransactionCategory(transaction)),
                                  color: 'white',
                                }}
                                className="capitalize"
                              >
                                {getTransactionCategory(transaction)}
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell className="w-[120px] text-center">
                            <span
                              className={`font-medium ${
                                getTransactionType(transaction).toUpperCase().includes('EXPENSE') ? 'text-red-500' : 'text-green-500'
                              }`}
                            >
                              {getTransactionType(transaction).toUpperCase().includes('EXPENSE') ? '-' : '+'}$
                              {parseFloat(transaction.amount || 0).toFixed(2)}
                            </span>
                          </TableCell>
                          
                          <TableCell className="w-[130px] text-center">
                            <div className="flex justify-center">
                              <TooltipProvider>
                                <UITooltip>
                                  <TooltipTrigger>
                                    {isRecurringTransaction(transaction) ? (
                                      <Badge variant="secondary" className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        Recurring
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        One-time
                                      </Badge>
                                    )}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-sm">
                                      {isRecurringTransaction(transaction)
                                        ? 'Recurring transaction'
                                        : 'One-time transaction'}
                                    </p>
                                  </TooltipContent>
                                </UITooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          
                          <TableCell className="w-[60px] text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleEdit(transaction)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(transaction)}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      </div>
    </>
  );
};

export default AllTransaction;