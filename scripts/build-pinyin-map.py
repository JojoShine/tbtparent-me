"""
从开源成语库生成成语→拼音映射表
数据源: https://github.com/pwxcoo/chinese-xinhua
输出: src/data/idiom-pinyin.json
格式: { "成语": ["pīn", "yīn", "shù", "jù"] }
"""

import json
import ssl
import urllib.request

# 1. 下载成语数据
URL = "https://raw.githubusercontent.com/pwxcoo/chinese-xinhua/master/data/idiom.json"
print(f"正在下载: {URL}")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=60, context=ctx) as resp:
    raw_data = json.loads(resp.read().decode('utf-8'))

print(f"下载完成，共 {len(raw_data)} 条成语")

# 2. 读取本地成语库
with open('src/data/idioms.json', 'r', encoding='utf-8') as f:
    local_idioms = json.load(f)
local_set = set(local_idioms)
print(f"本地成语: {len(local_set)} 条")

# 3. 构建拼音映射 (成语 → [拼音1, 拼音2, 拼音3, 拼音4])
pinyin_map = {}
unmatched = []

for item in raw_data:
    word = item.get('word', '')
    py = item.get('pinyin', '')
    
    if len(word) != 4 or word not in local_set:
        continue
    
    # pinyin 格式: "ā bí dì yù" (空格分隔)
    parts = py.split()
    if len(parts) == 4:
        pinyin_map[word] = parts
    else:
        unmatched.append(f"{word}: {py}")

print(f"已映射: {len(pinyin_map)} 条成语的拼音")
print(f"未匹配拼音: {len(unmatched)} 条")

if unmatched:
    print("\n未匹配示例 (前10):")
    for u in unmatched[:10]:
        print(f"  {u}")

# 4. 统计覆盖情况
covered = len(pinyin_map)
total = len(local_set)
print(f"\n覆盖率: {covered}/{total} ({covered/total*100:.1f}%)")
print(f"未覆盖: {total - covered} 条 (将使用 pinyin-pro 实时转换)")

# 5. 写入文件
output_path = 'src/data/idiom-pinyin.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(pinyin_map, f, ensure_ascii=False, indent=2)

file_size = len(json.dumps(pinyin_map, ensure_ascii=False)) 
print(f"\n已保存 {output_path} ({file_size/1024:.1f}KB)")

# 6. 展示一些多音字成语示例
polyphone_examples = []
poly_chars = '乐长重调弹难中传为行好还相数发干地朝都差藏曾乘将给称处当分种更间落恶强假模便倒兴冲量监应角解背薄泊参宿折了空得没看说和扇转舍创禁漂供'
for word, pinyins in pinyin_map.items():
    for i, char in enumerate(word):
        if char in poly_chars:
            polyphone_examples.append(f"  {word} → {char}: {pinyins[i]}")
            break

print(f"\n多音字成语示例 (前20):")
for ex in polyphone_examples[:20]:
    print(ex)
print(f"共 {len(polyphone_examples)} 条含多音字的成语已精确映射")
