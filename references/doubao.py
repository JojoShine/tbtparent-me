"""
Windows 桌面宠物 Desktop Pet
============================
功能：透明无边框窗口 | 拖动移动 | 点击互动(跳跃/压扁/抖动) | 中文对话气泡
      右键菜单(调整大小/置顶/退出) | 滚轮缩放 | 支持替换角色图片
用法：直接运行 或 用 PyInstaller 打包为 .EXE
"""

import tkinter as tk
from tkinter import Menu
from PIL import Image, ImageDraw, ImageTk
import random, math, sys, os

TKEY = '#010101'  # 窗口透明色键


class DesktopPet:
    def __init__(self):
        # ── 窗口初始化 ──────────────────────────────
        self.root = tk.Tk()
        self.root.overrideredirect(True)
        self.root.attributes('-topmost', True)
        self.root.attributes('-transparentcolor', TKEY)
        self.root.config(bg=TKEY)

        # ── 状态 ────────────────────────────────────
        self.base_size = 200
        self.scale = 1.0
        self.is_topmost = True
        self.animating = False

        # ── 角色图像 ────────────────────────────────
        self._build_images()

        # ── 画布 ────────────────────────────────────
        sz = self._sz()
        self.canvas = tk.Canvas(self.root, bg=TKEY, highlightthickness=0,
                                width=sz, height=sz)
        self.canvas.pack()
        self._photo = None
        self._show(self.img_normal)

        # ── 绑定事件 ────────────────────────────────
        self.canvas.bind('<ButtonPress-1>', self._press)
        self.canvas.bind('<B1-Motion>', self._drag)
        self.canvas.bind('<Button-3>', self._ctx_menu)
        self.canvas.bind('<MouseWheel>', self._wheel)
        self._dx = self._dy = 0

        # ── 初始位置(屏幕右下角) ────────────────────
        sw = self.root.winfo_screenwidth()
        sh = self.root.winfo_screenheight()
        self.root.geometry(f'+{sw - 260}+{sh - 310}')

        # ── 气泡 ────────────────────────────────────
        self._bubble = None
        self._bubble_job = None

        # ── 对话台词 ────────────────────────────────
        self.lines = [
            "你好呀~", "嘿嘿~", "摸摸我！", "今天心情真好！",
            "有点饿了…", "来陪我玩！", "咕噜咕噜~", "别戳我啦！",
            "你在忙什么？", "好无聊啊~", "嘻嘻嘻~", "想睡觉了…",
            "主人好！", "喵呜~", "拜托拜托~", "好开心呀！",
            "困了困了…", "你在看什么？", "哎呀~", "别走别走！",
            "打个盹…", "嘿嘿嘿~", "要抱抱！", "主人最棒了~",
        ]

        self.root.mainloop()

    # ═══════════════════════════════════════════════════
    #  图像生成 / 加载
    # ═══════════════════════════════════════════════════

    def _build_images(self):
        here = os.path.dirname(os.path.abspath(sys.argv[0]))
        path = os.path.join(here, 'pet.png')

        if os.path.isfile(path):
            base = Image.open(path).convert('RGBA').resize(
                (self.base_size, self.base_size), Image.LANCZOS)
            self.img_normal = base.copy()
            self.img_happy = base.copy()
            sw, sh = int(self.base_size * 1.2), int(self.base_size * 0.7)
            sq = base.resize((sw, sh), Image.LANCZOS)
            canvas = Image.new('RGBA', (self.base_size, self.base_size), (1, 1, 1, 0))
            canvas.paste(sq, ((self.base_size - sw) // 2, self.base_size - sh))
            self.img_squash = canvas
        else:
            self.img_normal = self._draw_cat('normal')
            self.img_happy = self._draw_cat('happy')
            self.img_squash = self._draw_squash()

    def _draw_cat(self, mood='normal'):
        S = self.base_size
        img = Image.new('RGBA', (S, S), (1, 1, 1, 0))
        g = ImageDraw.Draw(img)
        cx, cy = S // 2, S // 2 + 5
        R = S // 3
        body = '#FFB74D'
        out = '#E65100'

        # 阴影
        g.ellipse([cx - R + 4, cy - R + 10, cx + R + 4, cy + R + 10],
                  fill=(0, 0, 0, 35))
        # 身体
        g.ellipse([cx - R, cy - R, cx + R, cy + R], fill=body, outline=out, width=2)
        # 耳朵
        for s in (-1, 1):
            bx = cx + s * (R - 8)
            g.polygon([(bx, cy - R + 12), (bx + s * 15, cy - R - 24),
                       (bx - s * 13, cy - R)], fill=body, outline=out)
            g.polygon([(bx + s * 2, cy - R + 10), (bx + s * 11, cy - R - 17),
                       (bx - s * 9, cy - R)], fill='#FF8A65')
        # 眼睛
        ey, eo = cy - 4, 14
        if mood == 'happy':
            for s in (-1, 1):
                ex = cx + s * eo
                g.arc([ex - 8, ey - 6, ex + 8, ey + 8], 0, 180,
                      fill='#4E342E', width=3)
        else:
            for s in (-1, 1):
                ex = cx + s * eo
                g.ellipse([ex - 5, ey - 5, ex + 5, ey + 5], fill='#4E342E')
                g.ellipse([ex - 3, ey - 3, ex, ey], fill='white')
        # 鼻子
        ny = cy + 7
        g.polygon([(cx, ny - 2), (cx - 3, ny + 3), (cx + 3, ny + 3)], fill='#BF360C')
        # 嘴巴
        my = cy + 13
        if mood == 'happy':
            g.arc([cx - 10, my - 4, cx + 10, my + 10], 0, 180,
                  fill='#4E342E', width=2)
        else:
            g.arc([cx - 7, my - 3, cx, my + 5], 180, 360, fill='#4E342E', width=2)
            g.arc([cx, my - 3, cx + 7, my + 5], 180, 360, fill='#4E342E', width=2)
        # 腮红
        for s in (-1, 1):
            bx = cx + s * 24
            g.ellipse([bx - 7, cy + 4, bx + 7, cy + 13], fill='#FFAB91')
        # 爪子
        for s in (-1, 1):
            px = cx + s * 12
            g.ellipse([px - 9, cy + R - 9, px + 9, cy + R + 7], fill=out)
        # 尾巴
        pts = [(cx + R - 8, cy + R - 14)]
        for t in range(1, 16):
            tx = cx + R - 8 + t * 3
            ty = cy + R - 14 - math.sin(t * 0.4) * 20
            pts.append((tx, ty))
        for i in range(len(pts) - 1):
            g.line([pts[i], pts[i + 1]], fill=out, width=3)

        return img

    def _draw_squash(self):
        S = self.base_size
        img = self._draw_cat('normal')
        w, h = int(S * 1.2), int(S * 0.7)
        sq = img.resize((w, h), Image.LANCZOS)
        result = Image.new('RGBA', (S, S), (1, 1, 1, 0))
        result.paste(sq, ((S - w) // 2, S - h))
        return result

    # ═══════════════════════════════════════════════════
    #  显示
    # ═══════════════════════════════════════════════════

    def _sz(self):
        return max(50, int(self.base_size * self.scale))

    def _show(self, img):
        sz = self._sz()
        resized = img.resize((sz, sz), Image.LANCZOS)
        self._photo = ImageTk.PhotoImage(resized)
        self.root.geometry(f'{sz}x{sz}')
        self.canvas.config(width=sz, height=sz)
        self.canvas.delete('all')
        self.canvas.create_image(sz // 2, sz // 2, image=self._photo)

    # ═══════════════════════════════════════════════════
    #  交互
    # ═══════════════════════════════════════════════════

    def _press(self, e):
        self._dx = e.x_root - self.root.winfo_x()
        self._dy = e.y_root - self.root.winfo_y()
        if not self.animating:
            self._interact()

    def _drag(self, e):
        self.root.geometry(f'+{e.x_root - self._dx}+{e.y_root - self._dy}')
        self._pos_bubble()

    def _interact(self):
        self.animating = True
        random.choice([self._jump, self._squash, self._shake])()
        self._bubble_show()

    # —— 跳跃 ——
    def _jump(self):
        self._show(self.img_happy)
        oy = self.root.winfo_y()

        def step(i=0):
            if i < 20:
                dy = int(-45 * math.sin(math.pi * i / 20))
                self.root.geometry(f'+{self.root.winfo_x()}+{oy + dy}')
                self.root.after(18, lambda: step(i + 1))
            else:
                self.root.geometry(f'+{self.root.winfo_x()}+{oy}')
                self._show(self.img_normal)
                self.animating = False

        step()

    # —— 压扁回弹 ——
    def _squash(self):
        self._show(self.img_squash)

        def done():
            self._show(self.img_normal)
            self.animating = False

        self.root.after(300, done)

    # —— 左右抖动 ——
    def _shake(self, i=0):
        if i < 8:
            self._show(self.img_happy if i % 2 == 0 else self.img_normal)
            dx = 8 * (1 if i % 2 == 0 else -1)
            self.root.geometry(f'+{self.root.winfo_x() + dx}+{self.root.winfo_y()}')
            self.root.after(55, lambda: self._shake(i + 1))
        else:
            self._show(self.img_normal)
            self.animating = False

    # ═══════════════════════════════════════════════════
    #  对话气泡
    # ═══════════════════════════════════════════════════

    def _bubble_show(self):
        self._bubble_hide()

        self._bubble = tk.Toplevel(self.root)
        self._bubble.overrideredirect(True)
        self._bubble.attributes('-topmost', True)
        self._bubble.config(bg='white')

        frame = tk.Frame(self._bubble, bg='white', padx=2, pady=2)
        frame.pack()
        tk.Label(frame, text=random.choice(self.lines),
                 font=('Microsoft YaHei', 10, 'bold'),
                 bg='white', fg='#333', padx=12, pady=6).pack()

        self._bubble.update_idletasks()
        self._pos_bubble()
        self._bubble_job = self.root.after(2500, self._bubble_hide)

    def _pos_bubble(self):
        if not self._bubble:
            return
        sz = self._sz()
        px, py = self.root.winfo_x(), self.root.winfo_y()
        self._bubble.update_idletasks()
        bw = self._bubble.winfo_reqwidth()
        bx = px + (sz - bw) // 2
        by = py - self._bubble.winfo_reqheight() - 8
        # 如果气泡超出屏幕顶部，则移到角色下方
        if by < 0:
            by = py + sz + 8
        self._bubble.geometry(f'+{bx}+{by}')

    def _bubble_hide(self):
        if self._bubble_job:
            self.root.after_cancel(self._bubble_job)
            self._bubble_job = None
        if self._bubble:
            self._bubble.destroy()
            self._bubble = None

    # ═══════════════════════════════════════════════════
    #  右键菜单
    # ═══════════════════════════════════════════════════

    def _ctx_menu(self, e):
        m = Menu(self.root, tearoff=0, font=('Microsoft YaHei', 9))

        sm = Menu(m, tearoff=0, font=('Microsoft YaHei', 9))
        for label, val in [('小', 0.5), ('中', 1.0), ('大', 1.5), ('超大', 2.0)]:
            sm.add_command(label=label, command=lambda v=val: self._set_scale(v))
        m.add_cascade(label='调整大小', menu=sm)

        m.add_command(
            label='取消置顶' if self.is_topmost else '窗口置顶',
            command=self._toggle_topmost)
        m.add_separator()
        m.add_command(label='退出程序', command=self.root.destroy)

        m.tk_popup(e.x_root, e.y_root)

    def _set_scale(self, s):
        self.scale = s
        self._show(self.img_normal)

    def _toggle_topmost(self):
        self.is_topmost = not self.is_topmost
        self.root.attributes('-topmost', self.is_topmost)

    def _wheel(self, e):
        d = 0.1 if e.delta > 0 else -0.1
        self.scale = max(0.3, min(3.0, self.scale + d))
        self._show(self.img_normal)
        self._pos_bubble()


if __name__ == '__main__':
    DesktopPet()