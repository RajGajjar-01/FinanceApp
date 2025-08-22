import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CalendarIcon, Loader2, Camera, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router';
import Navbar from '@/components/navbar';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useTracker } from '@/contexts/tracker-context';

const dummyCategories = {
  INCOME: [
    { id: 'SALARY', name: 'Salary' },
    { id: 'BUSINESS', name: 'Business Income' },
    { id: 'INVESTMENT', name: 'Investment Returns' },
    { id: 'FREELANCE', name: 'Freelance/Consulting' },
    { id: 'RENTAL', name: 'Rental Income' },
    { id: 'BONUS', name: 'Bonus/Commission' },
    { id: 'REFUND', name: 'Refunds' },
    { id: 'GIFT', name: 'Gifts Received' },
  ],
  EXPENSE: [
    // Essential Expenses
    { id: 'FOOD', name: 'Food & Dining' },
    { id: 'GROCERIES', name: 'Groceries' },
    { id: 'TRANSPORT', name: 'Transportation' },
    { id: 'FUEL', name: 'Fuel/Gas' },
    { id: 'BILLS', name: 'Bills & Utilities' },
    { id: 'RENT', name: 'Rent/Mortgage' },
    { id: 'INSURANCE', name: 'Insurance' },
    { id: 'HEALTHCARE', name: 'Healthcare' },
    
    // Lifestyle & Personal
    { id: 'SHOPPING', name: 'Shopping' },
    { id: 'CLOTHING', name: 'Clothing & Accessories' },
    { id: 'ENTERTAINMENT', name: 'Entertainment' },
    { id: 'EDUCATION', name: 'Education' },
    { id: 'TRAVEL', name: 'Travel' },
    { id: 'FITNESS', name: 'Fitness & Sports' },
    { id: 'PERSONAL_CARE', name: 'Personal Care' },
    { id: 'SUBSCRIPTIONS', name: 'Subscriptions' },
    
    // Financial
    { id: 'SAVINGS', name: 'Savings' },
    { id: 'INVESTMENTS', name: 'Investments' },
    { id: 'LOAN_PAYMENT', name: 'Loan Payments' },
    { id: 'CREDIT_CARD', name: 'Credit Card Payment' },
    { id: 'BANK_FEES', name: 'Bank Fees' },
    { id: 'TAXES', name: 'Taxes' },
    
    // Family & Social
    { id: 'CHILDCARE', name: 'Childcare' },
    { id: 'PET_CARE', name: 'Pet Care' },
    { id: 'CHARITY', name: 'Charity/Donations' },
    { id: 'GIFTS_GIVEN', name: 'Gifts Given' },
    
    // Home & Maintenance
    { id: 'HOME_IMPROVEMENT', name: 'Home Improvement' },
    { id: 'MAINTENANCE', name: 'Maintenance & Repairs' },
    
    // Other
    { id: 'OTHER', name: 'Other' },
  ],
};


// Reusable FormField Component
const FormField = ({ label, error, children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <label className="block text-sm font-medium text-foreground">{label}</label>
    {children}
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);

const AddTransactionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanError, setScanError] = useState(null);
  const fileInputRef = useRef(null);

  const {axiosPrivate} = useAuth();
  const {fetchAccounts} = useTracker();

  const [dummyAccounts, setDummyAccounts] = useState([]);
  
  useEffect(()=>{
      const fxn = async() => {
        const res = await fetchAccounts();
        setDummyAccounts(res.data);
      }
      fxn();
  }, []);

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
      accountId: dummyAccounts.find((acc) => acc.isDefault)?.id || dummyAccounts[0]?.id,
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

    try {
      const response = await axiosPrivate.post('expense/transactions/', {
        ...data,
      });


      reset();
      navigate('/transactions');
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setScanError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle image upload and scanning
  const handleImageUpload = async (file) => {
    if (!file) return;

    setScanLoading(true);
    setScanError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axiosPrivate.post('expense/scan/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const scannedData = response.data.data;


        
        // Populate form with scanned data
        setValue('amount', scannedData.amount);
        setValue('description', scannedData.description);
        setValue('category', scannedData.category);
        setValue('date', new Date(scannedData.date));
        setValue('type', scannedData.type);


        
        // Clear image after successful scan
        setSelectedImage(null);
        setImagePreview(null);
        
        // You can add toast notification here
        // toast.success('Receipt scanned successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to scan receipt');
      }
    } catch (error) {

      setScanError(
        error.response?.data?.error || 
        error.message || 
        'Failed to scan receipt. Please try again.'
      );
      // toast.error('Failed to scan receipt. Please try again.');
    } finally {
      setScanLoading(false);
    }
  };

  // Handle scan receipt button click
  const handleScanReceipt = () => {
    setScanError(null);
    fileInputRef.current?.click();
  };

  // Remove selected image
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setScanError(null);
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
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-2xl font-bold text-center">Add Transaction</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="mb-8">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment" 
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />   
      
                <Button
                  type="button"
                  size="lg"
                  className="w-full h-12 bg-green-500/90 hover:bg-green-600/90 border-0 transition-all duration-200"
                  onClick={handleScanReceipt}
                  disabled={scanLoading || loading}
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
                          <div className="text-lg font-semibold text-white">Scan Receipt</div>
                        </div>
                      </div>
                    </>
                  )}
                </Button>

               
                {imagePreview && (
                  <div className="mt-4 p-4 border border-gray-400 rounded-lg ">
                    <div className="flex items-start gap-4">
                      <img 
                        src={imagePreview} 
                        alt="Receipt preview" 
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Ready to scan receipt
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className=""
                            onClick={() => handleImageUpload(selectedImage)}
                            disabled={scanLoading}
                          >
                            {scanLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Process Receipt
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeSelectedImage}
                            disabled={scanLoading}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error display */}
                {scanError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{scanError}</p>
                  </div>
                )}
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
                          <SelectItem value="EXPENSE">Expense</SelectItem>
                          <SelectItem value="INCOME">Income</SelectItem>
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
                      name="account"
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
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
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
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
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
