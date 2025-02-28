"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { createTransfer } from "~/server/actions/transfers";
import { toast } from "sonner";
import { getAllUsers } from "~/server/actions/getAllUsers";
import { getCategories } from "~/server/actions/getCategories";

// Create schema for form validation
const formSchema = z.object({
  receiverHandle: z.string({
    required_error: "Please select a recipient",
  }),
  amount: z.coerce
    .number()
    .positive("Amount must be positive")
    .min(0.01, "Minimum amount is $0.01"),
  categoryId: z.string({
    required_error: "Please select a category",
  }),
});

type FormValues = z.infer<typeof formSchema>;
type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export function SendMoneyDialog({
  triggerButton,
  maxAmount,
  accountId,
  onSuccess,
}: {
  triggerButton?: React.ReactNode;
  maxAmount: number;
  accountId: string;
  onSuccess?: () => void;
}) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<
    Array<{ id: string; handle: string | null; name: string | null }>
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(
      formSchema.refine((data) => data.amount <= maxAmount, {
        message: `You can't send more than $${maxAmount.toFixed(2)}`,
        path: ["amount"],
      }),
    ),
    defaultValues: {
      amount: 0,
    },
  });

  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !form.getValues("categoryId")) {
      // Find a "Transfer" category or use the first one
      const transferCategory =
        categories.find(
          (cat) => cat.name === "Transfer" || cat.name === "Transfers",
        ) || categories[0];
      form.setValue("categoryId", transferCategory?.id!);
    }
  }, [categories, form]);

  // Get valid users (non-null handles, excluding current user)
  const getValidUsers = () => {
    return users.filter(
      (user) => user && user.handle && user.id !== session?.user?.id,
    );
  };

  // Fetch all users and categories when dialog opens
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setIsLoading(true);
      try {
        // Load users if not already loaded
        if (users.length === 0) {
          const fetchedUsers = await getAllUsers();
          setUsers(fetchedUsers);
        }

        // Load categories if not already loaded
        if (categories.length === 0) {
          const fetchedCategories = await getCategories();
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle form submission
  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      // Find the selected user
      const selectedUser = users.find(
        (user) => user.handle === values.receiverHandle,
      );

      if (!selectedUser || !selectedUser.handle) {
        throw new Error("Selected user not found or has invalid data");
      }

      // Find the selected category
      const selectedCategory = categories.find(
        (cat) => cat.id === values.categoryId,
      );

      // Create transfer with category information
      const result = await createTransfer({
        amount: values.amount,
        description: selectedCategory?.name || "Transfer",
        senderAccountId: accountId,
        receiverAccountNumber: selectedUser.handle,
        categoryId: values.categoryId,
      });

      if (result.success) {
        toast.success(
          `Successfully sent $${values.amount.toFixed(2)} to ${
            selectedUser.name || selectedUser.handle
          }`,
        );

        setIsOpen(false);
        form.reset();

        // Call the onSuccess callback to refresh dashboard data
        if (onSuccess) {
          await onSuccess();
        }
      } else {
        toast.error(result.message || "Failed to send money");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Failed to send money. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="flex h-24 flex-col items-center justify-center space-y-2">
            <ArrowRightIcon className="h-6 w-6" />
            <span>Send Money</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Send Money</DialogTitle>
              <DialogDescription>
                Transfer money to another user. Your current balance: $
                {maxAmount.toFixed(2)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="receiverHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading || getValidUsers().length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a recipient" />
                        </SelectTrigger>
                        <SelectContent>
                          {getValidUsers().map((user) => (
                            <SelectItem key={user.id} value={user.handle!}>
                              {user.name || user.handle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={maxAmount}
                          placeholder="0.00"
                          className="pl-8"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading || categories.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center">
                                <span className="mr-2">{category.icon}</span>
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? "Sending..." : "Send Money"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
