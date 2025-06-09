
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Attorney {
  id: string;
  first_name: string;
  last_name: string;
}

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  assignedAttorneyId: string;
}

interface ClientFormFieldsProps {
  formData: ClientFormData;
  attorneys: Attorney[];
  onFieldChange: (field: keyof ClientFormData, value: string) => void;
}

export function ClientFormFields({ formData, attorneys, onFieldChange }: ClientFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => onFieldChange('firstName', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => onFieldChange('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => onFieldChange('phone', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attorney">Assigned Attorney</Label>
        <Select
          value={formData.assignedAttorneyId}
          onValueChange={(value) => onFieldChange('assignedAttorneyId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an attorney" />
          </SelectTrigger>
          <SelectContent>
            {attorneys.map((attorney) => (
              <SelectItem key={attorney.id} value={attorney.id}>
                {attorney.first_name} {attorney.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
