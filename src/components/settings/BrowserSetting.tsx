import { useChromeConfig } from '@/hooks/useChromeConfig'
import { useLiveControl } from '@/hooks/useLiveControl'
import { useToast } from '@/hooks/useToast'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { CodeIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { IPC_CHANNELS } from 'shared/ipcChannels'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export function BrowserSetting() {
  const { path, setPath } = useChromeConfig()
  const { isConnected } = useLiveControl()
  const [isDetecting, setIsDetecting] = useState(false)
  const { toast } = useToast()

  // 监听主进程发送的 Chrome 路径
  useEffect(() => {
    const removeListener = window.ipcRenderer.on(IPC_CHANNELS.setChromePath, (path: string) => {
      if (path)
        setPath(path)
    })
    return () => removeListener()
  }, [setPath])

  const handleSelectChrome = async () => {
    try {
      const path = await window.ipcRenderer.invoke(IPC_CHANNELS.selectChromePath)
      if (path) {
        setPath(path)

        toast.success('Chrome 路径设置成功')
      }
    }
    catch {
      toast.error('选择 Chrome 路径失败')
    }
  }

  const handleAutoDetect = async () => {
    try {
      setIsDetecting(true)
      const result = await window.ipcRenderer.invoke(IPC_CHANNELS.getChromePath)
      if (result) {
        setPath(result)

        toast.success('已自动检测到 Chrome 路径')
      }
      else {
        toast.error('未检测到 Chrome，请确保 Chrome 已打开')
      }
    }
    catch {
      toast.error('检测 Chrome 路径失败')
    }
    finally {
      setIsDetecting(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>浏览器设置</CardTitle>
        <CardDescription>配置 Chrome 浏览器路径</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 自动检测 */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">自动检测 Chrome</h4>
              <p className="text-sm text-muted-foreground">
                <strong>打开 Chrome 浏览器后</strong>
                点击检测，自动获取安装路径
              </p>
            </div>
            <Button
              variant="default"
              onClick={handleAutoDetect}
              disabled={isDetecting}
              className="flex-shrink-0"
            >
              <MagnifyingGlassIcon className={`mr-2 h-4 w-4 ${isDetecting ? 'animate-spin' : ''}`} />
              {isDetecting ? '检测中...' : '开始检测'}
            </Button>
          </div>
        </div>

        {/* 手动配置 */}
        <div className="space-y-1">
          <Label>Chrome 路径</Label>
          <div className="flex gap-2">
            <Input
              value={path}
              onChange={e => setPath(e.target.value)}
              placeholder="请选择或输入 Chrome 浏览器路径"
              className="font-mono"
            />
            <Button
              variant="outline"
              onClick={handleSelectChrome}
            >
              <CodeIcon className="mr-2 h-4 w-4" />
              浏览
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {isConnected
              ? '已成功连接到 Chrome'
              : path
                ? '请确保路径正确，并重新连接直播控制台'
                : '请选择 Chrome 浏览器的安装路径（chrome.exe）'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
