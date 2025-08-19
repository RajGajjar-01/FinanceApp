import React, { useState, useMemo } from 'react';
import TransactionNavbar from './transaction-navbar';
import { useLocation } from 'react-router';
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
  Trash2 
} from 'lucide-react';
import { transactions, DATE_RANGES } from './dummyData';

const ITEMS_PER_PAGE = 10;

// Category colors for badges
const categoryColors = {
  salary: '#22c55e',
  rent: '#ef4444',
  groceries: '#f59e0b',
  utilities: '#8b5cf6',
  shopping: '#ec4899',
  investment: '#10b981',
  bonus: '#06b6d4',
  insurance: '#6366f1',
  consulting: '#84cc16',
  default: '#6b7280',
};

const AllTransaction = () => {
  const location = useLocation();
  const accountData = location.state || {};
  const { accountName, accountType, accountBalance } = accountData;

  const [dateRange, setDateRange] = useState('1M');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState(''); // New filter for recurring/one-time
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and group data for chart
  const chartData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000)
      : new Date(0);

    const filtered = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= now;
    });

    const grouped = filtered.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }

      if (transaction.type === 'INCOME') {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }

      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [dateRange]);

  // Filter transactions for table
  const filteredTransactions = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000)
      : new Date(0);

    let result = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= now;
    });

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(lower));
    }

    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
    }

    // New filter for transaction type (recurring/one-time)
    if (transactionTypeFilter) {
      if (transactionTypeFilter === 'RECURRING') {
        result = result.filter((t) => t.isRecurring === true);
      } else if (transactionTypeFilter === 'ONE_TIME') {
        result = result.filter((t) => t.isRecurring === false);
      }
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [dateRange, searchTerm, typeFilter, transactionTypeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === 'INCOME') acc.income += t.amount;
        else acc.expense += t.amount;
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

  const getCategoryColor = (description) => {
    const key = description.toLowerCase();
    return categoryColors[key] || categoryColors.default;
  };

  const handleEdit = (transaction) => {
    console.log('Edit transaction:', transaction);
    // Add edit functionality here
  };

  const handleDelete = (transaction) => {
    console.log('Delete transaction:', transaction);
    // Add delete functionality here
  };

  return (
    <>
      <TransactionNavbar />

      <div className="container mx-auto px-4 py-6">
        <>
          {/* Account Details Card */}
          <div className="bg-card border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold capitalize text-blue-500">{accountName}</h1>
                <p className="text-muted-foreground mt-1">{accountType} Account</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">
                  ${parseFloat(accountBalance || 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">187 Transactions</p>
              </div>
            </div>
          </div>

          {/* Transaction Overview Card */}
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
              {/* Summary Stats */}
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

              {/* Bar Chart */}
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
                    <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Table Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">All Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
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
                
                {/* Income/Expense Filter */}
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

                {/* Transaction Type Filter (New) */}
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

              {/* Enhanced Table with Fixed Columns */}
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
                      paginatedTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-muted/50">
                          <TableCell className="w-[120px] text-center">
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: '2-digit',
                            })}
                          </TableCell>
                          
                          <TableCell className="w-[200px] text-center">
                            <div className="truncate" title={transaction.description}>
                              {transaction.description}
                            </div>
                          </TableCell>
                          
                          <TableCell className="w-[150px] text-center">
                            <div className="flex justify-center">
                              <Badge
                                style={{
                                  backgroundColor: getCategoryColor(transaction.description),
                                  color: 'white',
                                }}
                                className="capitalize"
                              >
                                {transaction.description}
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell className="w-[120px] text-center">
                            <span
                              className={`font-medium ${
                                transaction.type === 'EXPENSE' ? 'text-red-500' : 'text-green-500'
                              }`}
                            >
                              {transaction.type === 'EXPENSE' ? '-' : '+'}$
                              {transaction.amount.toFixed(2)}
                            </span>
                          </TableCell>
                          
                          <TableCell className="w-[130px] text-center">
                            <div className="flex justify-center">
                              <TooltipProvider>
                                <UITooltip>
                                  <TooltipTrigger>
                                    {transaction.isRecurring ? (
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
                                      {transaction.isRecurring
                                        ? 'Recurring transaction'
                                        : 'One-time transaction'}
                                    </p>
                                  </TooltipContent>
                                </UITooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          
                          {/* Actions Column with Dropdown Menu */}
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

              {/* Pagination */}
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
