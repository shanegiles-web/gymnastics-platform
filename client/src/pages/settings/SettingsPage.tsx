import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export function SettingsPage() {
  const [settings, setSettings] = useState({
    facilityName: 'GymFlow Gymnastics',
    address: '123 Gym Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    phone: '(217) 555-1234',
    timezone: 'America/Chicago',
    geofenceLat: '39.7817',
    geofenceLng: '-89.6501',
    geofenceRadius: '500',
  })

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    console.log('Saving settings:', settings)
  }

  return (
    <PageLayout>
      <PageHeader
        title="Settings"
        subtitle="Facility configuration and preferences"
      />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Facility Information</CardTitle>
            <CardDescription>Basic facility details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Facility Name"
              value={settings.facilityName}
              onChange={(e) => handleChange('facilityName', e.target.value)}
            />
            <Input
              label="Phone"
              type="tel"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <Input
              label="Address"
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City"
                value={settings.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
              <Input
                label="State"
                value={settings.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
              <Input
                label="ZIP Code"
                value={settings.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timezone</CardTitle>
            <CardDescription>Set your facility timezone</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              label="Timezone"
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              placeholder="America/Chicago"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Geofence Configuration</CardTitle>
            <CardDescription>Set geofence location for staff check-in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                value={settings.geofenceLat}
                onChange={(e) => handleChange('geofenceLat', e.target.value)}
                placeholder="39.7817"
              />
              <Input
                label="Longitude"
                value={settings.geofenceLng}
                onChange={(e) => handleChange('geofenceLng', e.target.value)}
                placeholder="-89.6501"
              />
            </div>
            <Input
              label="Radius (meters)"
              type="number"
              value={settings.geofenceRadius}
              onChange={(e) => handleChange('geofenceRadius', e.target.value)}
              placeholder="500"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danger Zone</CardTitle>
            <CardDescription>Advanced settings and data management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="secondary">Export All Data</Button>
            <Separator />
            <Button variant="destructive">Delete All Data</Button>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave}>Save Changes</Button>
          <Button variant="secondary">Cancel</Button>
        </div>
      </div>
    </PageLayout>
  )
}
