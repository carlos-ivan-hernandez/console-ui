import { Fragment as e, jsx as t, jsxs as n } from "react/jsx-runtime";
// src/lib/markdown.tsx
var r = {
	h1: "var(--blue)",
	h2: "var(--blue)",
	h3: "var(--purple)",
	h4: "var(--purple)",
	h5: "var(--fg)",
	h6: "var(--fg)"
}, i = /^(#{1,6})\s+(.*)/, a = /^(\s*)(-)(.*)$/, o = (e, t) => {
	let n = [
		t.h1,
		t.h2,
		t.h3,
		t.h4,
		t.h5,
		t.h6
	], r = t.h1;
	return e.split("\n").map((e) => {
		let a = i.exec(e);
		return a && (r = n[a[1].length - 1] ?? t.h1), {
			text: e,
			heading: a ? {
				hashes: a[1],
				text: a[2]
			} : null,
			color: r
		};
	});
}, s = ({ content: i, colors: s = r, empty: c = "(empty)" }) => i.trim() ? /* @__PURE__ */ t("div", {
	className: "md",
	children: o(i, s).map((r, i) => {
		if (r.heading) return /* @__PURE__ */ n("p", {
			className: `md-h md-h${r.heading.hashes.length}`,
			style: { color: r.color },
			children: [/* @__PURE__ */ n("span", {
				className: "dim",
				children: [r.heading.hashes, " "]
			}), r.heading.text]
		}, i);
		let o = a.exec(r.text);
		return /* @__PURE__ */ t("p", {
			className: "md-line",
			children: o ? /* @__PURE__ */ n(e, { children: [
				o[1],
				/* @__PURE__ */ t("span", {
					style: { color: r.color },
					children: o[2]
				}),
				o[3]
			] }) : r.text || " "
		}, i);
	})
}) : /* @__PURE__ */ t("p", {
	className: "dim",
	children: c
});
export { s as n, r as t };

//# sourceMappingURL=markdown-_rEhdm09.js.map