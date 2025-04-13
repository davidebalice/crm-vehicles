import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  TRANSACTION_TYPES, 
  TRANSACTION_CATEGORIES, 
  TRANSACTION_PAYMENT_METHODS 
} from '@/lib/constants';

// Schema di validazione per il form
const transactionFormSchema = z.object({
  description: z.string().min(3, 'La descrizione è obbligatoria e deve contenere almeno 3 caratteri'),
  amount: z.coerce.number().positive('L\'importo deve essere positivo'),
  type: z.string().min(1, 'Il tipo è obbligatorio'),
  category: z.string().min(1, 'La categoria è obbligatoria'),
  date: z.date({
    required_error: "La data è obbligatoria",
  }),
  paymentMethod: z.string().min(1, 'Il metodo di pagamento è obbligatorio'),
  reference: z.string().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  transactionId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({ transactionId, onSuccess, onCancel }: TransactionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = !!transactionId;
  
  // Form setup
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: '',
      amount: undefined,
      type: 'expense',
      category: '',
      date: new Date(),
      paymentMethod: 'cash',
      reference: '',
      relatedEntityType: '',
      relatedEntityId: undefined,
      notes: '',
    }
  });
  
  // Fetch transaction data if editing
  const { data: transactionData, isLoading: isLoadingTransaction } = useQuery({
    queryKey: ['/api/transactions', transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      const response = await fetch(`/api/transactions/${transactionId}`);
      if (!response.ok) {
        throw new Error('Impossibile caricare i dati della transazione');
      }
      return response.json();
    },
    enabled: !!transactionId
  });
  
  // Mutation for create/update
  const mutation = useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      if (isEditing) {
        const response = await apiRequest('PUT', `/api/transactions/${transactionId}`, data);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/transactions', data);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? 'Transazione aggiornata' : 'Transazione creata',
        description: isEditing 
          ? 'La transazione è stata aggiornata con successo' 
          : 'La transazione è stata creata con successo',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      console.error('Errore transazione:', error);
      toast({
        title: 'Errore',
        description: `Si è verificato un errore: ${error.message}`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setLoading(false);
    }
  });
  
  // Set form values when editing and data is loaded
  useEffect(() => {
    if (isEditing && transactionData) {
      form.reset({
        ...transactionData,
        date: new Date(transactionData.date),
        amount: parseFloat(transactionData.amount),
        relatedEntityId: transactionData.relatedEntityId || undefined
      });
    }
  }, [isEditing, transactionData, form]);
  
  // Submit handler
  const onSubmit = (data: TransactionFormValues) => {
    setLoading(true);
    mutation.mutate(data);
  };
  
  if (isEditing && isLoadingTransaction) {
    return <div className="flex justify-center p-4">Caricamento dati...</div>;
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione</FormLabel>
                <FormControl>
                  <Input placeholder="Descrizione della transazione" {...field} />
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
                <FormLabel>Importo</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01" 
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(TRANSACTION_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(TRANSACTION_CATEGORIES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metodo di Pagamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona metodo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(TRANSACTION_PAYMENT_METHODS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleziona data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Riferimento</FormLabel>
                <FormControl>
                  <Input placeholder="Num. fattura o riferimento" {...field} />
                </FormControl>
                <FormDescription>
                  Opzionale: numero di fattura o altro riferimento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Note aggiuntive sulla transazione"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvataggio...' : isEditing ? 'Aggiorna' : 'Crea'}
          </Button>
        </div>
      </form>
    </Form>
  );
}