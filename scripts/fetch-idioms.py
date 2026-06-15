"""
从开源成语库下载并扩充本地成语数据
数据源: https://github.com/pwxcoo/chinese-xinhua (31648条成语)
输出: 更新 src/data/idioms.json
"""

import json
import urllib.request
import ssl

# 1. 下载开源成语库
URL = "https://raw.githubusercontent.com/pwxcoo/chinese-xinhua/master/data/idiom.json"
print(f"正在下载成语数据: {URL}")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
    raw_data = json.loads(resp.read().decode('utf-8'))

print(f"下载完成，共 {len(raw_data)} 条成语")

# 2. 提取四字成语
four_char_idioms = set()
for item in raw_data:
    word = item.get('word', '')
    if len(word) == 4:
        four_char_idioms.add(word)

print(f"四字成语: {len(four_char_idioms)} 条")

# 3. 读取现有成语库
with open('src/data/idioms.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

existing_set = set(existing)
print(f"现有成语: {len(existing)} 条")

# 4. 合并（去重）
merged = existing_set | four_char_idioms
# 只保留四字成语
merged = sorted([w for w in merged if len(w) == 4])

new_count = len(merged) - len(existing_set)
print(f"新增成语: {new_count} 条")
print(f"合并后总数: {len(merged)} 条")

# 5. 写入文件
with open('src/data/idioms.json', 'w', encoding='utf-8') as f:
    json.dump(merged, f, ensure_ascii=False, indent=2)

print(f"\n已更新 src/data/idioms.json")
