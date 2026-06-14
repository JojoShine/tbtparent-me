'use client'

import { useState } from 'react'
import { useLang } from '@/hooks/useLang'

export default function NetworkCommands() {
  const { lang } = useLang()
  const [selectedBrand, setSelectedBrand] = useState('huawei')
  const [searchKeyword, setSearchKeyword] = useState('')

  // 华为命令库
  const huaweiCommands = [
    {
      category: lang === 'zh' ? '基础配置' : 'Basic Configuration',
      commands: [
        { cmd: 'system-view', desc: lang === 'zh' ? '进入系统视图' : 'Enter system view' },
        { cmd: 'sysname <name>', desc: lang === 'zh' ? '配置设备名称' : 'Configure device name' },
        { cmd: 'display current-configuration', desc: lang === 'zh' ? '查看当前配置' : 'View current configuration' },
        { cmd: 'display saved-configuration', desc: lang === 'zh' ? '查看保存的配置' : 'View saved configuration' },
        { cmd: 'save', desc: lang === 'zh' ? '保存配置' : 'Save configuration' },
      ]
    },
    {
      category: lang === 'zh' ? '接口配置' : 'Interface Configuration',
      commands: [
        { cmd: 'interface GigabitEthernet 0/0/1', desc: lang === 'zh' ? '进入接口视图' : 'Enter interface view' },
        { cmd: 'ip address <ip> <mask>', desc: lang === 'zh' ? '配置IP地址' : 'Configure IP address' },
        { cmd: 'shutdown', desc: lang === 'zh' ? '关闭接口' : 'Shutdown interface' },
        { cmd: 'undo shutdown', desc: lang === 'zh' ? '开启接口' : 'Enable interface' },
        { cmd: 'display ip interface brief', desc: lang === 'zh' ? '查看接口IP摘要' : 'View interface IP summary' },
      ]
    },
    {
      category: lang === 'zh' ? 'VLAN配置' : 'VLAN Configuration',
      commands: [
        { cmd: 'vlan <id>', desc: lang === 'zh' ? '创建VLAN' : 'Create VLAN' },
        { cmd: 'port link-type access', desc: lang === 'zh' ? '设置Access模式' : 'Set Access mode' },
        { cmd: 'port link-type trunk', desc: lang === 'zh' ? '设置Trunk模式' : 'Set Trunk mode' },
        { cmd: 'port default vlan <id>', desc: lang === 'zh' ? 'Access口加入VLAN' : 'Add port to VLAN (Access)' },
        { cmd: 'port trunk allow-pass vlan <id>', desc: lang === 'zh' ? 'Trunk口允许VLAN通过' : 'Allow VLAN on Trunk' },
        { cmd: 'display vlan', desc: lang === 'zh' ? '查看VLAN信息' : 'View VLAN information' },
      ]
    },
    {
      category: lang === 'zh' ? '路由配置' : 'Routing Configuration',
      commands: [
        { cmd: 'ip route-static <dest> <mask> <next-hop>', desc: lang === 'zh' ? '配置静态路由' : 'Configure static route' },
        { cmd: 'ospf <process-id>', desc: lang === 'zh' ? '启用OSPF' : 'Enable OSPF' },
        { cmd: 'area <area-id>', desc: lang === 'zh' ? '配置OSPF区域' : 'Configure OSPF area' },
        { cmd: 'network <ip> <wildcard>', desc: lang === 'zh' ? '宣告网段' : 'Advertise network' },
        { cmd: 'display ip routing-table', desc: lang === 'zh' ? '查看路由表' : 'View routing table' },
      ]
    },
    {
      category: lang === 'zh' ? '安全配置' : 'Security Configuration',
      commands: [
        { cmd: 'aaa', desc: lang === 'zh' ? '进入AAA视图' : 'Enter AAA view' },
        { cmd: 'local-user <username> password cipher <pwd>', desc: lang === 'zh' ? '配置本地用户' : 'Configure local user' },
        { cmd: 'local-user <username> service-type telnet', desc: lang === 'zh' ? '配置用户服务类型' : 'Configure user service type' },
        { cmd: 'user-interface vty 0 4', desc: lang === 'zh' ? '进入VTY视图' : 'Enter VTY view' },
        { cmd: 'authentication-mode aaa', desc: lang === 'zh' ? '设置认证模式' : 'Set authentication mode' },
      ]
    },
    {
      category: lang === 'zh' ? '诊断命令' : 'Diagnostic Commands',
      commands: [
        { cmd: 'ping <ip>', desc: lang === 'zh' ? 'Ping测试' : 'Ping test' },
        { cmd: 'tracert <ip>', desc: lang === 'zh' ? '跟踪路由' : 'Trace route' },
        { cmd: 'display interface brief', desc: lang === 'zh' ? '查看接口状态' : 'View interface status' },
        { cmd: 'display cpu-usage', desc: lang === 'zh' ? '查看CPU使用率' : 'View CPU usage' },
        { cmd: 'display memory-usage', desc: lang === 'zh' ? '查看内存使用率' : 'View memory usage' },
      ]
    }
  ]

  // 华三命令库
  const h3cCommands = [
    {
      category: lang === 'zh' ? '基础配置' : 'Basic Configuration',
      commands: [
        { cmd: 'system-view', desc: lang === 'zh' ? '进入系统视图' : 'Enter system view' },
        { cmd: 'sysname <name>', desc: lang === 'zh' ? '配置设备名称' : 'Configure device name' },
        { cmd: 'display current-configuration', desc: lang === 'zh' ? '查看当前配置' : 'View current configuration' },
        { cmd: 'display saved-configuration', desc: lang === 'zh' ? '查看保存的配置' : 'View saved configuration' },
        { cmd: 'save', desc: lang === 'zh' ? '保存配置' : 'Save configuration' },
      ]
    },
    {
      category: lang === 'zh' ? '接口配置' : 'Interface Configuration',
      commands: [
        { cmd: 'interface GigabitEthernet 1/0/1', desc: lang === 'zh' ? '进入接口视图' : 'Enter interface view' },
        { cmd: 'ip address <ip> <mask>', desc: lang === 'zh' ? '配置IP地址' : 'Configure IP address' },
        { cmd: 'shutdown', desc: lang === 'zh' ? '关闭接口' : 'Shutdown interface' },
        { cmd: 'undo shutdown', desc: lang === 'zh' ? '开启接口' : 'Enable interface' },
        { cmd: 'display ip interface brief', desc: lang === 'zh' ? '查看接口IP摘要' : 'View interface IP summary' },
      ]
    },
    {
      category: lang === 'zh' ? 'VLAN配置' : 'VLAN Configuration',
      commands: [
        { cmd: 'vlan <id>', desc: lang === 'zh' ? '创建VLAN' : 'Create VLAN' },
        { cmd: 'port link-type access', desc: lang === 'zh' ? '设置Access模式' : 'Set Access mode' },
        { cmd: 'port link-type trunk', desc: lang === 'zh' ? '设置Trunk模式' : 'Set Trunk mode' },
        { cmd: 'port access vlan <id>', desc: lang === 'zh' ? 'Access口加入VLAN' : 'Add port to VLAN (Access)' },
        { cmd: 'port trunk permit vlan <id>', desc: lang === 'zh' ? 'Trunk口允许VLAN通过' : 'Allow VLAN on Trunk' },
        { cmd: 'display vlan', desc: lang === 'zh' ? '查看VLAN信息' : 'View VLAN information' },
      ]
    },
    {
      category: lang === 'zh' ? '路由配置' : 'Routing Configuration',
      commands: [
        { cmd: 'ip route-static <dest> <mask> <next-hop>', desc: lang === 'zh' ? '配置静态路由' : 'Configure static route' },
        { cmd: 'ospf', desc: lang === 'zh' ? '启用OSPF' : 'Enable OSPF' },
        { cmd: 'area <area-id>', desc: lang === 'zh' ? '配置OSPF区域' : 'Configure OSPF area' },
        { cmd: 'network <ip> <wildcard>', desc: lang === 'zh' ? '宣告网段' : 'Advertise network' },
        { cmd: 'display ip routing-table', desc: lang === 'zh' ? '查看路由表' : 'View routing table' },
      ]
    },
    {
      category: lang === 'zh' ? '安全配置' : 'Security Configuration',
      commands: [
        { cmd: 'local-user <username> class network', desc: lang === 'zh' ? '创建本地用户' : 'Create local user' },
        { cmd: 'password simple <pwd>', desc: lang === 'zh' ? '配置密码' : 'Configure password' },
        { cmd: 'service-type telnet', desc: lang === 'zh' ? '配置服务类型' : 'Configure service type' },
        { cmd: 'line vty 0 4', desc: lang === 'zh' ? '进入VTY线路' : 'Enter VTY line' },
        { cmd: 'authentication-mode scheme', desc: lang === 'zh' ? '设置认证模式' : 'Set authentication mode' },
      ]
    },
    {
      category: lang === 'zh' ? '诊断命令' : 'Diagnostic Commands',
      commands: [
        { cmd: 'ping <ip>', desc: lang === 'zh' ? 'Ping测试' : 'Ping test' },
        { cmd: 'tracert <ip>', desc: lang === 'zh' ? '跟踪路由' : 'Trace route' },
        { cmd: 'display interface brief', desc: lang === 'zh' ? '查看接口状态' : 'View interface status' },
        { cmd: 'display cpu', desc: lang === 'zh' ? '查看CPU使用率' : 'View CPU usage' },
        { cmd: 'display memory', desc: lang === 'zh' ? '查看内存使用率' : 'View memory usage' },
      ]
    }
  ]

  const commands = selectedBrand === 'huawei' ? huaweiCommands : h3cCommands

  // 过滤命令
  const filteredCommands = commands.map(category => ({
    ...category,
    commands: category.commands.filter(cmd => 
      !searchKeyword || 
      cmd.cmd.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      cmd.desc.toLowerCase().includes(searchKeyword.toLowerCase())
    )
  })).filter(category => category.commands.length > 0)

  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? '网络设备常用命令' : 'Network Device Commands'}
      </h3>
      <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '20px' }}>
        {lang === 'zh' 
          ? '查询华为和华三网络设备的常用配置命令，支持按品牌分类和关键词搜索' 
          : 'Query common configuration commands for Huawei and H3C network devices, with brand filtering and keyword search'}
      </p>

      {/* 品牌选择 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setSelectedBrand('huawei')}
          style={{
            padding: '8px 16px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            backgroundColor: selectedBrand === 'huawei' ? 'var(--fg)' : 'transparent',
            color: selectedBrand === 'huawei' ? 'var(--bg)' : 'var(--muted)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {lang === 'zh' ? '华为' : 'Huawei'}
        </button>
        <button
          onClick={() => setSelectedBrand('h3c')}
          style={{
            padding: '8px 16px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            backgroundColor: selectedBrand === 'h3c' ? 'var(--fg)' : 'transparent',
            color: selectedBrand === 'h3c' ? 'var(--bg)' : 'var(--muted)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {lang === 'zh' ? '华三' : 'H3C'}
        </button>
      </div>

      {/* 搜索框 */}
      <input
        type="text"
        placeholder={lang === 'zh' ? '搜索命令或说明...' : 'Search commands...'}
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        style={{
          width: '100%',
          height: '40px',
          padding: '0 10px',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          lineHeight: 'normal',
          backgroundColor: 'transparent',
          color: 'var(--fg)',
          outline: 'none',
          transition: 'border-color 0.15s ease',
          boxSizing: 'border-box',
          marginBottom: '16px',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
      />

      {/* 命令列表 */}
      {filteredCommands.length > 0 ? (
        <div>
          {filteredCommands.map((category, idx) => (
            <div key={idx} style={{ marginBottom: '24px' }}>
              <h4 className="font-mono" style={{ 
                color: 'var(--fg)', 
                fontSize: '0.9rem', 
                fontWeight: 700,
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border)',
              }}>
                {category.category}
              </h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {category.commands.map((item, cmdIdx) => (
                  <div 
                    key={cmdIdx}
                    style={{
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--border)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <code className="font-mono" style={{ 
                      color: '#38a169',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '4px',
                    }}>
                      {item.cmd}
                    </code>
                    <div className="font-mono" style={{ 
                      color: 'var(--muted)',
                      fontSize: '0.8rem',
                    }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message={lang === 'zh' ? '未找到匹配的命令' : 'No commands found'} />
      )}
    </div>
  )
}
