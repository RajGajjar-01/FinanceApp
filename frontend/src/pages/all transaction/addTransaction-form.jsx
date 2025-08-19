import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CalendarIcon, Loader2, Camera, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import TransactionNavbar from './transaction-navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Dummy data for accounts and categories
const dummyAccounts = [
  { id: '1', name: 'Personal', balance: 152124.4, isDefault: true },
  { id: '2', name: 'Business', balance: 0, isDefault: false },
  { id: '3', name: 'Work', balance: 5941.0, isDefault: false },
];

const dummyCategories = {
  INCOME: [
    { id: 'salary', name: 'Salary' },
    { id: 'freelance', name: 'Freelance' },
    { id: 'investment', name: 'Investment' },
    { id: 'bonus', name: 'Bonus' },
    { id: 'other-income', name: 'Other Income' },
  ],
  EXPENSE: [
    { id: 'rent', name: 'Rent' },
    { id: 'groceries', name: 'Groceries' },
    { id: 'utilities', name: 'Utilities' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'dining', name: 'Dining Out' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'travel', name: 'Travel' },
    { id: 'insurance', name: 'Insurance' },
    { id: 'other-expense', name: 'Other Expense' },
  ],
};

// Reusable FormField Component
const FormField = ({ label, error, children, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="block text-sm font-medium text-foreground">
      {label}
    </label>
    {children}
    {error && (
      <p className="text-sm text-red-500 mt-1">{error}</p>
    )}
  </div>
);

const AddTransactionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      type: 'EXPENSE',
      amount: '',
      description: '',
      accountId: dummyAccounts.find(acc => acc.isDefault)?.id || dummyAccounts[0]?.id,
      category: '',
      date: new Date(),
      isRecurring: false,
      recurringInterval: '',
    },
  });

  const type = watch('type');
  const isRecurring = watch('isRecurring');
  const filteredCategories = dummyCategories[type] || [];

  const onSubmit = async (data) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Transaction Data:', {
        ...data,
        amount: parseFloat(data.amount),
      });
      
      setLoading(false);
      reset();
      navigate('/tracker');
    }, 1500);
  };

  // Handle AI Receipt Scanning
  const handleScanReceipt = async () => {
    setScanLoading(true);
    
    // Simulate AI receipt scanning
    setTimeout(() => {
      // Simulate scanned data
      const scannedData = {
        amount: '24.99',
        description: 'Grocery Store Purchase',
        category: 'groceries',
        date: new Date(),
        type: 'EXPENSE'
      };

      // Populate form with scanned data
      setValue('amount', scannedData.amount);
      setValue('description', scannedData.description);
      setValue('category', scannedData.category);
      setValue('date', scannedData.date);
      setValue('type', scannedData.type);

      setScanLoading(false);
      
      // You can add toast notification here
      // toast.success('Receipt scanned successfully!');
      console.log('Receipt scanned:', scannedData);
    }, 2000);
  };

  const formatDate = (date) => {
    if (!date) return 'Pick a date';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <TransactionNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-2xl font-bold text-center">
                Add Transaction
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* AI Receipt Scanner Button */}
              <div className="mb-8">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-0 transition-all duration-200"
                  onClick={handleScanReceipt}
                  disabled={scanLoading}
                >
                  {scanLoading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin text-white" />
                      <span className="text-lg font-medium text-white">Scanning Receipt...</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Camera className="h-7 w-7 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-semibold text-white">
                            Scan Receipt with AI
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Transaction Type */}
                <FormField label="Transaction Type" error={errors.type?.message}>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: 'Transaction type is required' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EXPENSE">💸 Expense</SelectItem>
                          <SelectItem value="INCOME">💰 Income</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                {/* Amount and Account Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField label="Amount ($)" error={errors.amount?.message}>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-9 text-lg"
                      {...register('amount', {
                        required: 'Amount is required',
                        min: { value: 0.01, message: 'Amount must be greater than 0' },
                      })}
                    />
                  </FormField>

                  <FormField label="Account" error={errors.accountId?.message}>
                    <Controller
                      name="accountId"
                      control={control}
                      rules={{ required: 'Account is required' }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {dummyAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name} (${parseFloat(account.balance).toFixed(2)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                </div>

                {/* Category - Full width */}
                <FormField label="Category" error={errors.category?.message}>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                {/* Description */}
                <FormField label="Description" error={errors.description?.message}>
                  <Input
                    placeholder="Enter transaction description"
                    className="h-9 text-lg"
                    {...register('description', {
                      required: 'Description is required',
                      minLength: { value: 3, message: 'Description must be at least 3 characters' },
                    })}
                  />
                </FormField>

                {/* Date Picker */}
                <FormField label="Date" error={errors.date?.message}>
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: 'Date is required' }}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full h-9 pl-3 text-left justify-start text-lg',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-5 w-5" />
                            {field.value ? formatDate(field.value) : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </FormField>

                {/* Recurring Transaction Toggle */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-medium">Recurring Transaction</h3>
                      <p className="text-sm text-muted-foreground">
                        Set up a recurring schedule for this transaction
                      </p>
                    </div>
                    <Controller
                      name="isRecurring"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Recurring Interval */}
                {isRecurring && (
                  <FormField 
                    label="Recurring Interval" 
                    error={errors.recurringInterval?.message}
                    className="animate-in slide-in-from-top-2 duration-200"
                  >
                    <Controller
                      name="recurringInterval"
                      control={control}
                      rules={{ required: isRecurring ? 'Recurring interval is required' : false }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DAILY">📅 Daily</SelectItem>
                            <SelectItem value="WEEKLY">📆 Weekly</SelectItem>
                            <SelectItem value="MONTHLY">🗓️ Monthly</SelectItem>
                            <SelectItem value="YEARLY">📅 Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Action Buttons - Outside the form card */}
          <div className="flex gap-4 mt-5">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 h-10"
              onClick={() => navigate(-1)}
              disabled={loading || scanLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 h-10"
              disabled={loading || scanLoading}
              onClick={handleSubmit(onSubmit)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Transaction'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTransactionForm;
