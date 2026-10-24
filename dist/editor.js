import { t as e } from "./markdown-_rEhdm09.js";
import { jsx as t } from "react/jsx-runtime";
import { useEffect as n, useRef as r } from "react";
import { markdown as i } from "@codemirror/lang-markdown";
import { HighlightStyle as a, syntaxHighlighting as o } from "@codemirror/language";
import { Compartment as s } from "@codemirror/state";
import { Decoration as c, EditorView as l, ViewPlugin as u, keymap as d } from "@codemirror/view";
import { tags as f } from "@lezer/highlight";
import { Vim as p, getCM as m, vim as h } from "@replit/codemirror-vim";
import { basicSetup as g } from "codemirror";
// src/lib/editor/ConsoleEditor.tsx
var _ = {
	write: () => {},
	quit: () => {}
};
p.defineEx("write", "w", () => _.write()), p.defineEx("quit", "q", () => _.quit()), p.defineEx("wq", "wq", () => {
	_.write(), _.quit();
}), p.defineEx("xit", "x", () => {
	_.write(), _.quit();
});
var v = (t = e) => o(a.define([
	{
		tag: f.heading1,
		color: t.h1,
		fontWeight: "bold"
	},
	{
		tag: f.heading2,
		color: t.h2,
		fontWeight: "bold"
	},
	{
		tag: f.heading3,
		color: t.h3
	},
	{
		tag: f.heading4,
		color: t.h4
	},
	{
		tag: f.heading5,
		color: t.h5
	},
	{
		tag: f.heading6,
		color: t.h6
	},
	{
		tag: f.emphasis,
		fontStyle: "italic"
	},
	{
		tag: f.strong,
		fontWeight: "bold"
	},
	{
		tag: f.monospace,
		color: "var(--warn)"
	},
	{
		tag: f.link,
		color: "var(--blue)"
	},
	{
		tag: f.processingInstruction,
		color: "var(--dim)"
	}
])), y = (t = e) => {
	let n = [
		t.h1,
		t.h2,
		t.h3,
		t.h4,
		t.h5,
		t.h6
	], r = (e) => {
		let r = [], i = t.h1;
		for (let a = 1; a <= e.state.doc.lines; a++) {
			let o = e.state.doc.line(a), s = /^(#{1,6})\s+/.exec(o.text);
			s && (i = n[s[1].length - 1] ?? t.h1);
			let l = /^(\s*)-/.exec(o.text);
			if (l) {
				let e = o.from + l[1].length;
				r.push(c.mark({ attributes: { style: `color: ${i}` } }).range(e, e + 1));
			}
		}
		return c.set(r, !0);
	};
	return u.fromClass(class {
		decorations;
		constructor(e) {
			this.decorations = r(e);
		}
		update(e) {
			e.docChanged && (this.decorations = r(e.view));
		}
	}, { decorations: (e) => e.decorations });
}, b = l.theme({
	"&": {
		height: "100%",
		backgroundColor: "transparent",
		color: "var(--fg)",
		fontSize: "inherit"
	},
	"&.cm-focused": { outline: "none" },
	".cm-scroller": {
		fontFamily: "var(--font)",
		lineHeight: "1.5",
		overflow: "auto"
	},
	".cm-content": {
		padding: "0",
		caretColor: "var(--accent)"
	},
	".cm-line": { padding: "0" },
	".cm-gutters": { display: "none" },
	".cm-activeLine": { backgroundColor: "var(--bg-cursor)" },
	"&:not(.cm-focused) .cm-activeLine": { backgroundColor: "transparent" },
	".cm-cursor": {
		borderLeftColor: "var(--accent)",
		borderLeftWidth: "2px"
	},
	".cm-fat-cursor": {
		background: "var(--accent) !important",
		color: "var(--bg) !important"
	},
	"&:not(.cm-focused) .cm-fat-cursor": {
		background: "none !important",
		outline: "1px solid var(--dim)"
	},
	".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: "var(--bg-selection) !important" },
	".cm-panels": {
		backgroundColor: "var(--bg-bar)",
		color: "var(--fg)"
	},
	".cm-panels-bottom": { borderTop: "1px solid var(--border)" },
	".cm-vim-panel input": {
		fontFamily: "var(--font)",
		color: "var(--fg)"
	},
	".cm-searchMatch": { backgroundColor: "var(--bg-search-match)" }
}, { dark: !0 }), x = (e) => d.of([{
	key: "Tab",
	run: (t) => {
		let n = t.state.selection.main.head, r = n - t.state.doc.lineAt(n).from;
		return t.dispatch(t.state.replaceSelection(" ".repeat(e - r % e))), !0;
	}
}]), S = (e) => e === !1 ? [] : [
	i({ addKeymap: !1 }),
	v(e),
	y(e)
], C = (i) => {
	let { vimEnabled: a = !0, markdownColors: o = e, focused: c, value: u } = i, d = r(null), f = r(null), p = r(new s()), v = r(new s()), y = r("normal"), C = r(i);
	return n(() => {
		C.current = i;
	}), n(() => {
		let t = C.current, n = t.vimEnabled ?? !0, r = new l({
			doc: t.value,
			parent: d.current,
			extensions: [
				p.current.of(n ? h() : []),
				g,
				x(t.tabWidth ?? 2),
				b,
				v.current.of(S(t.markdownColors ?? e)),
				l.lineWrapping,
				l.updateListener.of((e) => {
					e.docChanged && C.current.onChange(e.state.doc.toString()), e.focusChanged && e.view.hasFocus && C.current.onFocus?.();
				}),
				...t.extensions ?? []
			]
		});
		f.current = r;
		let i = m(r), a = (e) => {
			y.current = e.mode, C.current.onModeChange?.(e.mode);
		};
		return i?.on("vim-mode-change", a), _.write = () => C.current.onWrite?.(), _.quit = () => C.current.onExit?.(), () => {
			i?.off("vim-mode-change", a), r.destroy(), f.current = null;
		};
	}, []), n(() => {
		y.current = "normal", C.current.onModeChange?.(a ? "normal" : "insert"), f.current?.dispatch({ effects: p.current.reconfigure(a ? h() : []) });
	}, [a]), n(() => {
		f.current?.dispatch({ effects: v.current.reconfigure(S(o)) });
	}, [o]), n(() => {
		let e = f.current;
		if (!e) return;
		let t = e.state.doc.toString();
		if (t !== u) {
			let n = Math.min(e.state.selection.main.head, u.length);
			e.dispatch({
				changes: {
					from: 0,
					to: t.length,
					insert: u
				},
				selection: { anchor: n }
			});
		}
	}, [u]), n(() => {
		let e = f.current;
		e && c !== void 0 && (c && !e.hasFocus && e.focus(), !c && e.hasFocus && e.contentDOM.blur());
	}, [c]), /* @__PURE__ */ t("div", {
		ref: d,
		className: `console-editor ${i.className ?? ""}`,
		onKeyDownCapture: (e) => {
			if (e.key !== "Escape" || e.target instanceof HTMLInputElement) return;
			let t = C.current;
			t.onExit && (!(t.vimEnabled ?? !0) || y.current === "normal") && (e.preventDefault(), e.stopPropagation(), t.onExit());
		}
	});
};
export { C as ConsoleEditor, b as consoleTheme, y as dashHighlight, v as markdownHighlight };

//# sourceMappingURL=editor.js.map