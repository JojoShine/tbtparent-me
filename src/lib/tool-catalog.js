export const TOOL_GROUPS = [
  { key: 'office', label: '办公', children: [
    { key: 'image-compressor', label: '图片压缩', label_en: 'Image Compressor' },
    { key: 'qrcode-generator', label: '二维码生成', label_en: 'QR Code Generator' },
    { key: 'photo-tool', label: '证件照制作', label_en: 'ID Photo Maker' },
    { key: 'background-remover', label: 'AI抠图', label_en: 'AI Background Remover' },
  ] },
  { key: 'network', label: '网络', children: [
    { key: 'ip-query', label: 'IP查询', label_en: 'IP Query' },
    { key: 'ip-calculator', label: 'IP计算器', label_en: 'IP Calculator' },
    { key: 'network-planning', label: '组网规划', label_en: 'Network Planning' },
    { key: 'network-latency', label: '延迟测试', label_en: 'Network Latency' },
    { key: 'dns-lookup', label: 'DNS查询', label_en: 'DNS Lookup' },
  ] },
]

export const BUILTIN_TOOLS = TOOL_GROUPS.flatMap(group => group.children.map(tool => ({
  ...tool, label_zh: tool.label, category_zh: group.label,
})))

export function getToolPath(key) {
  return `/tools?tool=${encodeURIComponent(key)}`
}
