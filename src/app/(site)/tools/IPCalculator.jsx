'use client'

import { useState } from 'react'
import { useLang } from '@/hooks/useLang'
import CustomSelect from './CustomSelect'

export default function IPCalculator() {
  const { lang } = useLang()
  const [ip, setIp] = useState('192.168.1.0')
  const [cidr, setCidr] = useState('24')
  const [result, setResult] = useState(null)
  const [availableHosts, setAvailableHosts] = useState(254)

  // 计算CIDR对应的可用主机数
  const calculateAvailableHosts = (cidrValue) => {
    const cidrNum = parseInt(cidrValue)
    if (isNaN(cidrNum) || cidrNum < 0 || cidrNum > 32) return 0
    if (cidrNum >= 31) return cidrNum === 32 ? 1 : 2
    return Math.pow(2, 32 - cidrNum) - 2
  }

  const handleCidrChange = (value) => {
    setCidr(value)
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

  const calculate = () => {
    if (!ip || !cidr) return

    const cidrNum = parseInt(cidr)
    if (cidrNum < 0 || cidrNum > 32) return

    const ipInt = ipToInt(ip)
    const mask = cidrNum === 0 ? 0 : (~0 << (32 - cidrNum)) >>> 0
    const network = (ipInt & mask) >>> 0
    const broadcast = (network | (~mask >>> 0)) >>> 0
    const firstHost = network + 1
    const lastHost = broadcast - 1
    const totalHosts = Math.pow(2, 32 - cidrNum) - 2
    const usableHosts = cidrNum >= 31 ? 0 : totalHosts

    setResult({
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      firstHost: cidrNum >= 31 ? 'N/A' : intToIp(firstHost),
      lastHost: cidrNum >= 31 ? 'N/A' : intToIp(lastHost),
      subnetMask: intToIp(mask),
      wildcardMask: intToIp(~mask >>> 0),
      totalHosts: cidrNum >= 31 ? (cidrNum === 32 ? 1 : 2) : totalHosts + 2,
      usableHosts: usableHosts,
      cidr: `/${cidrNum}`,
      binaryMask: mask.toString(2).padStart(32, '0').match(/.{1,8}/g).join('.'),
    })
  }

  const reset = () => {
    setIp('192.168.1.0')
    setCidr('24')
    setResult(null)
    setAvailableHosts(254)
  }

  return (
    <div style={{ padding: '24px' }}>
      <h3 className="font-mono font-bold" style={{ color: 'var(--fg)', marginBottom: '8px', fontSize: '1.2rem' }}>
        {lang === 'zh' ? 'IP计算器' : 'IP Calculator'}
      </h3>
      <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '20px' }}>
        {lang === 'zh' 
          ? '根据IP地址和CIDR计算子网信息，包括可用主机数、网络地址、广播地址等' 
          : 'Calculate subnet information based on IP and CIDR, including available hosts, network address, broadcast address'}
      </p>

      {/* 输入区域 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
              {lang === 'zh' ? 'IP地址：' : 'IP Address:'}
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
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
          </div>
          <div>
            <label className="font-mono" style={{ color: 'var(--fg)', fontSize: '0.8rem', marginBottom: '6px', display: 'block' }}>
              CIDR
            </label>
            <CustomSelect
              value={cidr}
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

        <button
          onClick={calculate}
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
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {lang === 'zh' ? '计算' : 'Calculate'}
        </button>
      </div>

      {/* 计算结果 */}
      {result && (
        <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px', fontSize: '0.85rem' }}>
            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '网络地址：' : 'Network:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.network}{result.cidr}</div>

            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '广播地址：' : 'Broadcast:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.broadcast}</div>

            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '子网掩码：' : 'Subnet Mask:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.subnetMask}</div>

            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '通配符掩码：' : 'Wildcard:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.wildcardMask}</div>

            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '可用主机：' : 'Usable Hosts:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.usableHosts.toLocaleString()}</div>

            <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '总地址数：' : 'Total Addresses:'}</div>
            <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.totalHosts.toLocaleString()}</div>

            {result.firstHost !== 'N/A' && (
              <>
                <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '首个主机：' : 'First Host:'}</div>
                <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.firstHost}</div>

                <div className="font-mono" style={{ color: 'var(--muted)' }}>{lang === 'zh' ? '末个主机：' : 'Last Host:'}</div>
                <div className="font-mono" style={{ color: 'var(--fg)' }}>{result.lastHost}</div>
              </>
            )}
          </div>
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
    </div>
  )
}
