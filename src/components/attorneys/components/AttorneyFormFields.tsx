
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Firm {
  id: string;
  name: string;
}

interface AttorneyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  barNumber: string;
  specialization: string;
  yearsExperience: string;
  hourlyRate: string;
  firmId: string;
}

interface AttorneyFormFieldsProps {
  formData: AttorneyFormData;
  onFieldChange: (field: keyof AttorneyFormData, value: string) => void;
  firms: Firm[];
  showFirmSelector: boolean;
}

export function AttorneyFormFields({ formData, onFieldChange, firms, showFirmSelector }: AttorneyFormFieldsProps) {
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

      {showFirmSelector && (
        <div className="space-y-2">
          <Label htmlFor="firm">Firm *</Label>
          <Select
            value={formData.firmId}
            onValueChange={(value) => onFieldChange('firmId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a firm" />
            </SelectTrigger>
            <SelectContent>
              {firms.map((firm) => (
                <SelectItem key={firm.id} value={firm.id}>
                  {firm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="barNumber">Bar Number</Label>
          <Input
            id="barNumber"
            value={formData.barNumber}
            onChange={(e) => onFieldChange('barNumber', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearsExperience">Years Experience</Label>
          <Input
            id="yearsExperience"
            type="number"
            min="0"
            value={formData.yearsExperience}
            onChange={(e) => onFieldChange('yearsExperience', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => onFieldChange('specialization', e.target.value)}
            placeholder="e.g., Corporate Law"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
          <Input
            id="hourlyRate"
            type="number"
            min="0"
            step="0.01"
            value={formData.hourlyRate}
            onChange={(e) => onFieldChange('hourlyRate', e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
