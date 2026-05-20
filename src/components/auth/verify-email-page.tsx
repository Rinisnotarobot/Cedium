import { useNavigate, useSearch } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Field, FieldLabel, FieldGroup } from '#/components/ui/field'
import { toast } from 'sonner'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_app/verify-email' })
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [sending, setSending] = useState(false)

  const email = search.email

  const handleVerify = async () => {
    if (!email) {
      toast.error('邮箱地址缺失，请重新登录')
      navigate({ to: '/login' })
      return
    }

    if (code.length !== 6) {
      toast.error('请输入6位验证码')
      return
    }

    setVerifying(true)
    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: code,
      })

      if (error) {
        toast.error(error.message ?? '验证失败，请检查验证码')
        return
      }

      if (data) {
        toast.success('邮箱验证成功')
        navigate({ to: '/profile' })
      }
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!email) return

    setSending(true)
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      })

      if (error) {
        toast.error(error.message ?? '发送失败，请稍后重试')
        return
      }

      toast.success('验证码已重新发送')
    } finally {
      setSending(false)
    }
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>邮箱验证</CardTitle>
            <CardDescription>缺少邮箱信息</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-center text-sm text-muted-foreground">
              请从个人资料页面发起验证
            </p>
            <Button variant="outline" onClick={() => navigate({ to: '/login' })}>
              返回登录
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>验证邮箱</CardTitle>
          <CardDescription>
            验证码已发送至 {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleVerify()
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="code">验证码</FieldLabel>
                <Input
                  id="code"
                  type="text"
                  placeholder="输入6位验证码"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                  autoComplete="one-time-code"
                />
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifying || code.length !== 6}
                >
                  {verifying ? '验证中...' : '验证'}
                </Button>
              </Field>

              <Field>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResend}
                  disabled={sending}
                >
                  {sending ? '发送中...' : '重新发送验证码'}
                </Button>
              </Field>

              <p className="text-center text-xs text-muted-foreground">
                验证码将在 10 分钟后失效
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}