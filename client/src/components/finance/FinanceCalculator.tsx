import { FC, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  vehiclePrice: z.number().min(1, "Inserisci il prezzo del veicolo"),
  downPayment: z.number().min(0, "Il valore deve essere positivo o zero"),
  interestRate: z.number().min(0, "Il tasso d'interesse deve essere positivo o zero"),
  term: z.number().min(1, "Il periodo deve essere almeno di 1 mese"),
  type: z.enum(["loan", "leasing"]),
});

type FinanceCalculatorValues = z.infer<typeof formSchema>;

interface FinanceCalculatorProps {
  vehiclePrice?: number;
}

const FinanceCalculator: FC<FinanceCalculatorProps> = ({
  vehiclePrice = 0
}) => {
  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalInterest: number;
    totalAmount: number;
  } | null>(null);
  
  const form = useForm<FinanceCalculatorValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehiclePrice: vehiclePrice,
      downPayment: 0,
      interestRate: 5.9,
      term: 48,
      type: "loan",
    },
  });
  
  const calculateFinance = (data: FinanceCalculatorValues) => {
    const loanAmount = data.vehiclePrice - data.downPayment;
    const monthlyInterestRate = data.interestRate / 100 / 12;
    const totalPayments = data.term;
    
    const monthlyPayment = 
      (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
    
    const totalAmount = monthlyPayment * totalPayments;
    const totalInterest = totalAmount - loanAmount;
    
    return {
      monthlyPayment,
      totalInterest,
      totalAmount,
    };
  };
  
  const onSubmit = (data: FinanceCalculatorValues) => {
    const calculationResult = calculateFinance(data);
    setResult(calculationResult);
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Calcolatore Finanziario</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vehiclePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prezzo del veicolo (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="downPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anticipo (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasso d'interesse (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durata (mesi)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo di finanziamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="loan">Prestito</SelectItem>
                      <SelectItem value="leasing">Leasing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">Calcola</Button>
          </form>
        </Form>
        
        {result && (
          <div className="mt-6 space-y-3">
            <Separator />
            <div className="pt-4">
              <h3 className="font-semibold text-lg">Risultato</h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-sm text-muted-foreground">Rata mensile:</div>
                <div className="text-sm font-medium text-right">
                  €{result.monthlyPayment.toFixed(2)}
                </div>
                
                <div className="text-sm text-muted-foreground">Interessi totali:</div>
                <div className="text-sm font-medium text-right">
                  €{result.totalInterest.toFixed(2)}
                </div>
                
                <div className="text-sm text-muted-foreground">Importo totale:</div>
                <div className="text-sm font-medium text-right">
                  €{result.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinanceCalculator;
