
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function DesignTokens() {
  return (
    <div className="container-padding section-spacing space-y-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Design System</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A comprehensive design system built for legal professional applications
        </p>
      </div>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Font hierarchy and text styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h1 className="font-display">Heading 1 - Display Font</h1>
            <h2 className="font-display">Heading 2 - Display Font</h2>
            <h3 className="font-display">Heading 3 - Display Font</h3>
            <h4 className="font-display">Heading 4 - Display Font</h4>
            <p className="font-sans">Body text - Sans Serif Font (Inter)</p>
            <p className="text-sm text-muted-foreground">Small text - Muted</p>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Primary brand colors and semantic colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-16 bg-primary rounded-lg"></div>
              <p className="text-sm font-medium">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-secondary rounded-lg"></div>
              <p className="text-sm font-medium">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-success rounded-lg"></div>
              <p className="text-sm font-medium">Success</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-destructive rounded-lg"></div>
              <p className="text-sm font-medium">Destructive</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>Different button styles and states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="success">Success</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Input fields and form controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Enter your email..." />
          <div className="flex gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Card Variants */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>Standard card styling</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a default card with standard styling.</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>Card with enhanced shadow</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card has an elevated appearance with enhanced shadows.</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Glass Card</CardTitle>
            <CardDescription>Card with glass morphism effect</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card uses a glass morphism effect.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
