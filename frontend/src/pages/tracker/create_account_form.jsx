import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { z } from 'zod';

const accountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(50, 'Account name must be less than 50 characters'),
  type: z.enum(['Current', 'Savings'], {
    required_error: 'Please select an account type',
  }),
  balance: z
    .string()
    .min(1, 'Initial balance is required')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Balance must be a valid number',
    }),
  isDefault: z.boolean().default(true), // Changed default to true
});

const CreateAccountForm = ({ children, onAccountCreate }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'Current',
      balance: '',
      isDefault: true,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newAccount = {
        id: Date.now(), // Simple ID generation for demo
        name: data.name,
        type: data.type,
        balance: parseFloat(data.balance),
        isDefault: data.isDefault,
      };

      onAccountCreate(newAccount);
      reset();
      setOpen(false);
      setIsLoading(false);

      // You can add toast notification here
      console.log('Account created successfully');
    }, 1000);
  };

  useEffect(() => {
    if (open) {
      reset({
        name: '',
        type: 'Current',
        balance: '',
        isDefault: true, 
      });
    }
  }, [open, reset]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 font-space-grotesk" >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Account Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Account Name
              </label>
              <Input id="name" placeholder="e.g., Main Checking" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Account Type - full width */}
            <div className="space-y-2 w-full">
              <label
                htmlFor="type"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Account Type
              </label>
              <Select
                onValueChange={(value) => setValue('type', value)}
                defaultValue={watch('type')}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Current">Current</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>

            {/* Initial Balance */}
            <div className="space-y-2">
              <label
                htmlFor="balance"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Initial Balance
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('balance')}
              />
              {errors.balance && <p className="text-sm text-red-500">{errors.balance.message}</p>}
            </div>

            {/* Set as Default - Initially ON */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <label htmlFor="isDefault" className="text-base font-medium cursor-pointer">
                  Set as Default
                </label>
                <p className="text-sm text-muted-foreground">
                  This account will be selected by default for transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={watch('isDefault')}
                onCheckedChange={(checked) => setValue('isDefault', checked)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAccountForm;