import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useSignWaiver } from '@/hooks/useWaivers'
import { toast } from 'sonner'

export function SignWaiverPage() {
  const navigate = useNavigate()
  const { mutate: signWaiver, isPending } = useSignWaiver()
  const [parentName, setParentName] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      toast.error('You must agree to the waiver')
      return
    }

    signWaiver(
      { waiverIdId: '1', parentName },
      {
        onSuccess: () => {
          toast.success('Waiver signed successfully!')
          navigate('/waivers')
        },
        onError: (error: unknown) => {
          const err = error as { message: string }
          toast.error(err?.message || 'Failed to sign waiver')
        },
      }
    )
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Liability Waiver</CardTitle>
            <CardDescription>Please read carefully and sign below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-surface-page p-4 rounded-md max-h-64 overflow-y-auto text-sm text-text-secondary border border-border-DEFAULT whitespace-pre-wrap">
              GYMNASTICS FACILITY WAIVER AND RELEASE OF LIABILITY

I understand that gymnastics is a physical activity that involves risk of injury. I acknowledge that I have read this waiver and fully understand its terms.

By participating in gymnastics activities, I assume all risks of injury or death resulting from my participation. I agree to release and hold harmless the facility, its owners, operators, instructors, and employees from all claims, demands, and causes of action arising out of or related to my participation.

I certify that I am in good physical condition and capable of participating in gymnastics activities. I will follow all safety instructions and use equipment only as directed.

Signed voluntarily at my own risk.
            </div>

            <form onSubmit={handleSign} className="space-y-4">
              <Input
                label="Parent/Guardian Name"
                placeholder="Full name"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                required
              />

              <div className="flex items-start gap-3">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                />
                <Label htmlFor="agree" className="text-sm cursor-pointer">
                  I have read and agree to the liability waiver above. I understand the risks involved in gymnastics activities and voluntarily assume those risks.
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isPending || !parentName || !agreed}
                >
                  {isPending ? 'Signing...' : 'Sign Waiver'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/waivers')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
