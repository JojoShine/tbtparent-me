'use client'

import { useState } from 'react'
import { useLang } from '@/hooks/useLang'
import CustomSelect from './CustomSelect'

export default function NetworkPlanning() {
  const { lang } = useLang()
  const [baseNetwork, setBaseNetwork] = useState('192.168.1.0')
  const [baseCidr, setBaseCidr] = useState('24')
  const [availableHosts, setAvailableHosts] = useState(254)
  const [subnets, setSubnets] = useState([
    { name: lang === 'zh' ? '部门A' : 'Dept A', hosts: 50 },
    { name: lang === 'zh' ? '部门B' : 'Dept B', hosts: 30 },
    { name: lang === 'zh' ? '部门C' : 'Dept C', hosts: 20 },
  ])
  const [result, setResult] = useState(null)

  // 计算CIDR对应的可用主机数
  const calculateAvailableHosts = (cidrValue) => {
    const cidrNum = parseInt(cidrValue)
    if (isNaN(cidrNum) || cidrNum < 0 || cidrNum > 32) return 0
    if (cidrNum >= 31) return cidrNum === 32 ? 1 : 2
    return Math.pow(2, 32 - cidrNum) - 2
  }

  const handleCidrChange = (value) => {
    setBaseCidr(value)
    const hosts = calculateAvailableHosts(value)
    setAvailableHosts(hosts)
  }

  // IP转整数
  const ipToInt = (ipStr) => {
    return ipStr.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
  }

  // 整数转IP
  const intToIp = (int) => {
    return [
      (int >>> 24) & 255,
      (int >>> 16) & 255,
      (int >>> 8) & 255,
      int & 255
    ].join('.')
  }

  // 计算所需CIDR
  const calculateCidr = (hosts) => {
    let bits = 0
    while (Math.pow(2, bits) - 2 < hosts) {
      bits++
    }
    return 32 - bits
  }

  const plan = () => {
    if (!baseNetwork || !baseCidr) return

    const baseCidrNum = parseInt(baseCidr)
    let currentIp = ipToInt(baseNetwork)
    const plannedSubnets = []

    // 按主机数从大到小排序（VLSM最佳实践）
    const sortedSubnets = [...subnets].sort((a, b) => b.hosts - a.hosts)

    for (const subnet of sortedSubnets) {
      const cidr = calculateCidr(subnet.hosts)
      if (cidr < baseCidrNum) {
        continue // 跳过超出范围的子网
      }

      const mask = (~0 << (32 - cidr)) >>> 0
      const network = (currentIp & mask) >>> 0
      const broadcast = (network | (~mask >>> 0)) >>> 0
      const totalHosts = Math.pow(2, 32 - cidr) - 2

      plannedSubnets.push({
        name: subnet.name,
        network: intToIp(network),
        cidr: `/${cidr}`,
        subnetMask: intToIp(mask),
        firstHost: intToIp(network + 1),
        lastHost: intToIp(broadcast - 1),
        broadcast: intToIp(broadcast),
        usableHosts: totalHosts,
        requiredHosts: subnet.hosts,
      })

      // 移动到下一个子网
      currentIp = broadcast + 1
    }

    setResult(plannedSubnets)
  }

  const addSubnet = () => {
    setSubnets([...subnets, { 
      name: `${lang === 'zh' ? '部门' : 'Dept'} ${subnets.length + 1}`, 
      hosts: 10 
    }])
  }

  const removeSubnet = (index) => {
    setSubnets(subnets.filter((_, i) => i !== index))
  }

  const updateSubnet = (index, field, value) => {
    const updated = [...subnets]
    updated[index][field] = field === 'hosts' ? parseInt(value) || 0 : value
    setSubnets(updated)
  }

  const reset = () => {
    setBaseNetwork('192.168.1.0')
    setBaseCidr('24')
    setSubnets([
      { name: lang === 'zh' ? '部门A' : 'Dept A', hosts: 50 },
      { name: lang === 'zh' ? '部门B' : 'Dept B', hosts: 30 },
      { name: lang === 'zh' ? '部门C' : 'Dept C', hosts: 20 },
    ])
    setResult(null)
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? '组网规划' : 'Network Planning'}
      </h3>
      <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '20px' }}>
        {lang === 'zh' 
          ? '根据基础网络和子网数量自动划分网段，生成详细的子网规划方案' 
          : 'Automatically divide network segments based on base network and subnet count, generate detailed subnet planning'}
      </p>

      {/* 基础网络 */}
      <div style={{ marginBottom: '16px' }}>
        <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
          {lang === 'zh' ? '基础网络：' : 'Base Network:'}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
          <input
            type="text"
            value={baseNetwork}
            onChange={(e) => setBaseNetwork(e.target.value)}
            placeholder="192.168.1.0"
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
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
          <div style={{ position: 'relative' }}>
            <CustomSelect
              value={baseCidr}
              onChange={handleCidrChange}
              onInputChange={handleCidrChange}
              options={Array.from({ length: 33 }, (_, i) => ({
                value: String(i),
                label: `/${i}`
              }))}
            />
            {/* 可用主机数提示 */}
            <div className="font-mono" style={{ 
              marginTop: '6px', 
              fontSize: '0.75rem', 
              color: '#38a169',
            }}>
              {lang === 'zh' ? '可用主机：' : 'Available Hosts: '} 
              <strong>{availableHosts.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 子网列表 */}
      <div style={{ marginBottom: '16px' }}>
        <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
          {lang === 'zh' ? '子网需求：' : 'Subnet Requirements:'}
        </label>
        {/* 表头说明 - 桌面端显示 */}
        <div className="subnet-header" style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.75rem' }}>
          <div style={{ flex: 2, color: 'var(--muted)', fontFamily: 'monospace' }}>
            {lang === 'zh' ? '部门名称' : 'Department Name'}
          </div>
          <div style={{ flex: 1, color: 'var(--muted)', fontFamily: 'monospace' }}>
            {lang === 'zh' ? '主机数量' : 'Host Count'}
          </div>
          <div style={{ width: '32px' }}></div>
        </div>
        {subnets.map((subnet, index) => (
          <div key={index} className="subnet-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={subnet.name}
              onChange={(e) => updateSubnet(index, 'name', e.target.value)}
              placeholder={lang === 'zh' ? '部门名称' : 'Department Name'}
              className="subnet-name-input"
              style={{
                flex: 2,
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                backgroundColor: 'transparent',
                color: 'var(--fg)',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <input
              type="number"
              value={subnet.hosts}
              onChange={(e) => updateSubnet(index, 'hosts', e.target.value)}
              placeholder={lang === 'zh' ? '主机数' : 'Hosts'}
              min="1"
              className="subnet-hosts-input"
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                backgroundColor: 'transparent',
                color: 'var(--fg)',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={() => removeSubnet(index)}
              className="subnet-remove-btn"
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                color: '#e53e3e',
                border: '1px solid #e53e3e',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {lang === 'zh' ? '删除' : 'Delete'}
            </button>
          </div>
        ))}
        <button
          onClick={addSubnet}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'transparent',
            color: 'var(--muted)',
            border: '1px dashed var(--border)',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--fg)'
            e.currentTarget.style.color = 'var(--fg)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--muted)'
          }}
        >
          + {lang === 'zh' ? '添加子网' : 'Add Subnet'}
        </button>
      </div>

      {/* 规划按钮 */}
      <button
        onClick={plan}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: 'var(--fg)',
          color: 'var(--bg)',
          border: 'none',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          cursor: 'pointer',
          transition: 'opacity 0.15s ease',
          marginBottom: '16px',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        {lang === 'zh' ? '生成规划' : 'Generate Plan'}
      </button>

      {/* 规划结果 */}
      {result && result.length > 0 && (
        <div>
          <h4 className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.9rem', marginBottom: '12px' }}>
            {lang === 'zh' ? '子网分配方案：' : 'Subnet Allocation:'}
          </h4>
          {result.map((subnet, index) => (
            <div key={index} style={{ 
              padding: '12px', 
              border: '1px solid var(--border)', 
              borderRadius: '4px',
              marginBottom: '8px',
            }}>
              <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                <span className="font-mono" style={{ color: 'var(--fg)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {subnet.name}
                </span>
                <span className="font-mono" style={{ color: 'var(--muted)', fontSize: '0.75rem', marginLeft: '8px' }}>
                  ({lang === 'zh' ? '需要' : 'Need'} {subnet.requiredHosts} {lang === 'zh' ? '主机' : 'hosts'})
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', fontSize: '0.8rem' }}>
                <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '网络地址：' : 'Network:'}</div>
                <div className="font-mono" style={{ color: 'var(--fg)', fontWeight: 600 }}>{subnet.network}{subnet.cidr}</div>

                <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '子网掩码：' : 'Subnet Mask:'}</div>
                <div className="font-mono" style={{ color: 'var(--fg)' }}>{subnet.subnetMask}</div>

                <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '主机范围：' : 'Host Range:'}</div>
                <div className="font-mono" style={{ color: 'var(--fg)' }}>{subnet.firstHost} - {subnet.lastHost}</div>

                <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '可用主机数：' : 'Usable Hosts:'}</div>
                <div className="font-mono" style={{ color: '#38a169', fontWeight: 600 }}>{subnet.usableHosts} {lang === 'zh' ? '台主机' : 'hosts'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 重置按钮 */}
      {result && (
        <button
          onClick={reset}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '10px',
            backgroundColor: 'transparent',
            color: 'var(--muted)',
            border: '1px solid var(--border)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--fg)'
            e.currentTarget.style.color = 'var(--fg)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--muted)'
          }}
        >
          {lang === 'zh' ? '重置' : 'Reset'}
        </button>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          /* 移动端隐藏表头 */
          .subnet-header {
            display: none !important;
          }
          
          /* 移动端子网行改为垂直布局 */
          .subnet-row {
            flex-direction: column !important;
            gap: 8px !important;
            padding: 12px !important;
            border: 1px solid var(--border) !important;
            border-radius: 4px !important;
            margin-bottom: 12px !important;
          }
          
          /* 输入框占满宽度 */
          .subnet-name-input,
          .subnet-hosts-input {
            width: 100% !important;
            flex: none !important;
          }
          
          /* 删除按钮占满宽度 */
          .subnet-remove-btn {
            width: 100% !important;
            padding: 10px !important;
          }
        }
      `}</style>
    </div>
  )
}
