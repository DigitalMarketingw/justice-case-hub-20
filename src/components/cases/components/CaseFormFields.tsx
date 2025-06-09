
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

interface FormData {
  title: string;
  case_number: string;
  client_id: string;
  case_type: string;
  status: string;
  description: string;
  priority: string;
  court_name: string;
  judge_name: string;
  court_date: string;
  filing_date: string;
  estimated_hours: number;
  billable_rate: number;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface CaseFormFieldsProps {
  control: Control<FormData>;
  clients: Client[];
}

export function CaseFormFields({ control, clients }: CaseFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter case title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="case_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter case number..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="client_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name} ({client.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="case_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Criminal, Civil, Family..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter case description..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="court_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Court Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter court name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="judge_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judge Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter judge name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="court_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Court Date (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={control}
          name="filing_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filing Date (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="estimated_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Hours</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  step="0.1"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="billable_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billable Rate ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
